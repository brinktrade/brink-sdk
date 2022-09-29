const _ = require('lodash')
const { ethers } = require('ethers')
const { toChecksumAddress, padLeft } = require('web3-utils')
const BigNumber = require('bignumber.js')
const { DEPLOY_AND_CALL, ACCOUNT_FACTORY } = require('@brinkninja/core/constants')
const proxyAccountFromOwner = require('./proxyAccountFromOwner')
const encodeFunctionCall = require('./encodeFunctionCall')
const verifySignedMessage = require('./verifySignedMessage')
const bitmapPointer = require('./utils/bitmapPointer')
const addSegmentedObj = require('./utils/addSegmentedObj')
const { VERIFIERS } = require('@brinkninja/config').mainnet

const BN = ethers.BigNumber.from

const _directCalls = [
  'externalCall',
  'delegateCall'
]

const _metaCalls = [
  'metaDelegateCall',
  'metaDelegateCall_EIP1271'
]

const _paramTypesMap = {
  'metaDelegateCall': [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes' },
    { name: 'signature', type: 'bytes' },
    { name: 'unsignedData', type: 'bytes'}
  ],
  'metaDelegateCall_EIP1271': [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes' },
    { name: 'signature', type: 'bytes' },
    { name: 'unsignedData', type: 'bytes'}
  ],
  'deployAndCall': [
    { name: 'owner', type: 'address' },
    { name: 'callData', type: 'bytes' }
  ],
  'delegateCall': [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes' }
  ],
  'externalCall': [
    { name: 'value', type: 'uint256'},
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes' }
  ]
}

const _abiMap = {
  Account: require('./contracts/Account.abi'),
  AccountFactory: require('./contracts/AccountFactory.abi'),
  DeployAndCall: require('./contracts/DeployAndCall.abi'),
  ERC20: require('./contracts/ERC20.abi')
}

class Account {
  constructor ({
    ownerAddress,
    provider,
    signer
  }) {
    this._ownerAddress = ownerAddress
    this._provider = provider
    this._signer = signer

    this.address = proxyAccountFromOwner(this._ownerAddress)

    this.estimateGas = {}
    this.populateTransaction = {}
    this.callStatic = {}

    // wraps ethers contract functions and exposes them on the Account object
    const _setupEthersWrappedTx = (fnNameSegments, fn, numParams) => {
      let txOptsIndex = numParams

      const segments = !_.isArray(fnNameSegments) ? [fnNameSegments] : fnNameSegments

      addSegmentedObj(this, segments, (async function () {
        const { contract, functionName, params } = await fn.apply(this, arguments)
        let txOptions = arguments[txOptsIndex] || {}
        const tx = await contract[functionName].apply(contract, [...params, txOptions])
        return tx
      }).bind(this))

      addSegmentedObj(this.estimateGas, segments, (async function () {
        const { contract, contractName, functionName, paramTypes, params } = await fn.apply(this, arguments)
        let txOptions = arguments[txOptsIndex] || {}
        const gas = await contract.estimateGas[functionName].apply(contract, [...params, txOptions])
        return { contractName, functionName, paramTypes, params, gas }
      }).bind(this))

      addSegmentedObj(this.populateTransaction, segments, (async function () {
        const { contract, contractName, functionName, paramTypes, params } = await fn.apply(this, arguments)
        let txOptions = arguments[txOptsIndex] || {}
        const txData = await contract.populateTransaction[functionName].apply(contract, [...params, txOptions])
        return {
          contractName, functionName, paramTypes, params,
          ...txData
        }
      }).bind(this))

      addSegmentedObj(this.callStatic, segments, (async function () {
        const { contract, contractName, functionName, paramTypes, params } = await fn.apply(this, arguments)
        let txOptions = arguments[txOptsIndex] || {}
        const returnValues = await contract.callStatic[functionName].apply(contract, [...params, txOptions])
        return { contractName, functionName, paramTypes, params, returnValues }
      }).bind(this))
    }

    _setupEthersWrappedTx('metaDelegateCall', async (signedMessage, unsignedParams = []) => {
      return this._metaDelegateCall(signedMessage, unsignedParams)
    }, 2)

    // sets up ethers functions for all verifiers in config
    VERIFIERS.forEach(({ contractName, functionName, contractAddress, paramTypes }) => {
      const unsignedParams = _.filter(paramTypes, t => !t.signed)
      const $this = this
      _setupEthersWrappedTx([contractName, functionName], async function () {
        const signedMessage = arguments[0]
        if (signedMessage.signedParams[0].value.toLowerCase() !== contractAddress.toLowerCase()) {
          throw new Error(`Wrong verifier address for ${functionName}, expected "${contractAddress}"`)
        }
        const unsignedParamVals = _.slice(arguments, 1, unsignedParams.length + 1)
        return $this._metaDelegateCall(signedMessage, unsignedParamVals)
      }, 1 + unsignedParams.length)
    })

    _setupEthersWrappedTx('deploy', async () => {
      if (await this.isDeployed()) {
        throw new Error(`Account contract already deployed`)
      }
      const accountFactory = this.accountFactoryContract()
      return {
        contract: accountFactory,
        contractName: 'AccountFactory',
        functionName: 'deployAccount',
        params: [this._ownerAddress],
        paramTypes: [ { name: 'owner', type: 'address' } ]
      }
    }, 0)

    _setupEthersWrappedTx('externalCall', async (value, to, data) => {
      const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
        'externalCall', [value, to, data]
      )
      return { contract, contractName, functionName, params, paramTypes }
    }, 3)

    _setupEthersWrappedTx('delegateCall', async (to, data) => {
      const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
        'delegateCall', [to, data]
      )
      return { contract, contractName, functionName, params, paramTypes }
    }, 2)
  }

  async _metaDelegateCall (signedMessage, unsignedParams) {
    verifySignedMessage(signedMessage)
    const { signedData, unsignedData } = this.getMetaDelegateCallData(signedMessage, unsignedParams)
    const verifierAddress = signedMessage.signedParams[0].value
    const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
      'metaDelegateCall',
      [verifierAddress, signedData, signedMessage.signature, unsignedData]
    )
    return { contract, contractName, functionName, params, paramTypes }
  }
  
  async isDeployed () {
    const code = await this._provider.getCode(this.address)
    return code !== '0x'
  }

  getMetaDelegateCallData(signedMessage, unsignedParams) {
    let functionCall = {}
    let callData = {}
    for (let i = 0; i < signedMessage.signedParams.length; i++) {
      if (signedMessage.signedParams[i].callData) {
        callData = signedMessage.signedParams[i].callData
      }
    }
    functionCall.functionName = callData.functionName
    functionCall.paramTypes = []
    functionCall.params = []
    for (let j = 0; j < callData.params.length; j++) {
      let paramType = {
        name: callData.params[j].name,
        type: callData.params[j].type
      }
      functionCall.paramTypes.push(paramType)
      if (callData.params[j].value) {
        let param = callData.params[j].value
        functionCall.params.push(param)
      }
    }
    const numParams = functionCall.params.length
    for (let k = 0; k < unsignedParams.length; k++) {
      functionCall.params.push(unsignedParams[k])
    }

    const encodedFnCall = encodeFunctionCall(functionCall)
    const { signedData, unsignedData } = splitCallData(encodedFnCall, numParams)
    return { signedData, unsignedData }
  }

  async nextBit () {
    let bitmapIndex = BN(0)
    let bit = BN(1)
    if (await this.isDeployed()) {
      let curBitmap, curBitmapBinStr
      let curBitmapIndex = -1
      let nextBitIndex = -1
      while(nextBitIndex < 0) {
        curBitmapIndex++
        curBitmap = await this.storageLoad(bitmapPointer(curBitmapIndex))
        curBitmapBinStr = bnToBinaryString(curBitmap)
        for (let i = 0; i < curBitmapBinStr.length; i++) {
          if (curBitmapBinStr.charAt(i) == '0') {
            nextBitIndex = i
            break
          }
        }
      }
      bitmapIndex = BN(curBitmapIndex)
      bit = BN(2).pow(BN(nextBitIndex))
    }
    return { bitmapIndex, bit }
  }

  async loadBitmap (bitmapIndex) {
    if (await this.isDeployed()) {
      const bmp = await this.storageLoad(bitmapPointer(bitmapIndex))
      // using bignumber.js here for the base-2 support
      return BN(bmp)
    } else {
      return BN(0)
    }
  }

  async bitUsed (bitmapIndex, bit) {
    if (!await this.isDeployed()) {
      return false
    }

    const bitmap = await this.storageLoad(bitmapPointer(bitmapIndex))
    const bmpBinStr = bnToBinaryString(bitmap)
    const bitBinStr = bnToBinaryString(bit)

    if (bmpBinStr.length !== bitBinStr.length) {
      throw new Error(`binary string length mismatch`)
    }

    for (let i = 0; i < bmpBinStr.length; i++) {
      const bmpChar = bmpBinStr[i]
      const bitChar = bitBinStr[i]
      if (bmpChar == 1 && bitChar == 1) {
        return true
      }
    }
    return false
  }

  async storageLoad (pos) {
    if (!await this.isDeployed()) {
      return '0x'
    } else {
      const val = await this._provider.getStorageAt(this.address, pos)
      return val
    }
  }

  async _sendAccountTransaction (functionName, params = []) {
    const {
      contract,
      functionName: txFunctionName,
      params: txParams
    } = await this._getTxData(functionName, params)
    const tx = await contract[txFunctionName].apply(this, txParams)
    return tx
  }

  async _getTxData (functionName, params) {
    const isDirect = _directCalls.includes(functionName)
    const isMeta = _metaCalls.includes(functionName)

    if (!isDirect && !isMeta) {
      throw new Error(`Function ${functionName} is not a valid Account function`)
    }

    if (await this.isDeployed()) {
      // returns direct tx to account
      return {
        contract: this.proxyAccountContract(),
        contractName: 'Account',
        functionName,
        paramTypes: _paramTypesMap[functionName],
        params
      }
    } else {
      if (isDirect) {
        throw new Error(`Function ${functionName} cannot be called before Account deploy`)
      }
      // returns batched deployAndCall tx

      return {
        contract: this.deployAndCallContract(),
        contractName: 'DeployAndCall',
        functionName: 'deployAndCall',
        paramTypes: _paramTypesMap['deployAndCall'],
        params: [
          this._ownerAddress,
          encodeFunctionCall({
            functionName,
            paramTypes: _paramTypesMap[functionName],
            params
          })
        ]
      }
    }
  }

  proxyAccountContract() {
    return this._ethersContract('Account', this.address)
  }

  accountFactoryContract() {
    return this._ethersContract('AccountFactory', ACCOUNT_FACTORY)
  }

  deployAndCallContract () {
    return this._ethersContract('DeployAndCall', DEPLOY_AND_CALL)
  }

  _ethersContract(contractName, contractAddress) {
    return new ethers.Contract(
      contractAddress, _abiMap[contractName], this._signer
    )
  }

  isProxyOwner (address) {
    return toChecksumAddress(address) == toChecksumAddress(this._ownerAddress)
  }
}

// splits a call for metaDelegateCall into signedData and unsignedData
// TODO: this only works if all signed data params are fixed bytes32, will not work for dynamic params
function splitCallData (callData, numSignedParams) {
  let parsedCallData = callData.indexOf('0x') == 0 ? callData.slice(2) : callData
  // signed data is the prefix + fnSig + signedParams
  const bytes32SlotLen = 64 
  const fnSigLen = 8
  const signedDataLen = fnSigLen + (numSignedParams * bytes32SlotLen)
  const signedData = `0x${parsedCallData.slice(0, signedDataLen)}`

  // unsigned data is the rest
  const unsignedData = `0x${parsedCallData.slice(signedDataLen)}`
  return { signedData, unsignedData }
}

function bnToBinaryString (bn) {
  // using bignumber.js here for the base-2 support
  const bitmapBN = new BigNumber(bn.toString())
  const bitmapBinStr = padLeft(bitmapBN.toString(2), 256, '0').split("").reverse().join("")
  return bitmapBinStr
}

module.exports = Account