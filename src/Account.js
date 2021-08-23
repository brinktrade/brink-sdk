const _ = require('lodash')
const { ethers } = require('ethers')
const { padLeft } = require('web3-utils')
const BigNumber = require('bignumber.js')
const computeAccountBytecode = require('./computeAccountBytecode')
const computeAccountAddress = require('./computeAccountAddress')
const encodeFunctionCall = require('./encodeFunctionCall')
const { ZERO_ADDRESS } = require('./constants')
const bitmapPointer = require('./utils/bitmapPointer')
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
  'deployAndExecute': [
    { name: 'initCode', type: 'bytes' },
    { name: 'salt', type: 'bytes32' },
    { name: 'execData', type: 'bytes' }
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
  IDeployer: require('./contracts/IDeployer.abi'),
  DeployAndExecute: require('./contracts/DeployAndExecute.abi'),
  ERC20: require('./contracts/ERC20.abi')
}

class Account {
  constructor ({
    ownerAddress,
    environment,
    provider,
    signer
  }) {
    this._environment = environment
    this._implementationAddress = _.find(this._environment.deployments, { name: 'account' }).address
    this._ownerAddress = ownerAddress
    this._accountVersion = this._environment.accountVersion
    this._accountDeploymentSalt = this._environment.accountDeploymentSalt
    this._provider = provider
    this._signer = signer
    this._deployerAddress = _.find(this._environment.deployments, { name: 'singletonFactory' }).address
    this._deployAndExecuteAddress = _.find(this._environment.deployments, { name: 'deployAndExecute' }).address

    this.address = computeAccountAddress(
      this._deployerAddress,
      this._implementationAddress,
      this._ownerAddress,
      this._accountDeploymentSalt
    )

    this._accountImpl = this._ethersContract('Account', this._implementationAddress)

    this.estimateGas = {}
    this.populateTransaction = {}
    this.callStatic = {}

    // wraps ethers contract functions and exposes them on the Account object
    const _setupEthersWrappedTx = (fnName, fn) => {
      this[fnName] = (async function () {
        const { contract, functionName, params } = await fn.apply(this, arguments)
        const tx = await contract[functionName].apply(contract, params)
        return tx
      }).bind(this)

      this.estimateGas[fnName] = (async function () {
        const { contract, contractName, functionName, paramTypes, params } = await fn.apply(this, arguments)
        const gas = await contract.estimateGas[functionName].apply(contract, params)
        return { contractName, functionName, paramTypes, params, gas }
      }).bind(this)

      this.populateTransaction[fnName] = (async function () {
        const { contract, contractName, functionName, paramTypes, params } = await fn.apply(this, arguments)
        const txData = await contract.populateTransaction[functionName].apply(contract, params)
        return {
          contractName, functionName, paramTypes, params,
          ...txData
        }
      }).bind(this)

      this.callStatic[fnName] = (async function () {
        const { contract, contractName, functionName, paramTypes, params } = await fn.apply(this, arguments)
        const returnValues = await contract.callStatic[functionName].apply(contract, params)
        return { contractName, functionName, paramTypes, params, returnValues }
      }).bind(this)
    }

    _setupEthersWrappedTx('sendLimitSwap', async (signedLimitSwapMessage, to, data) => {
      const { signedData, unsignedData } = this.getLimitSwapData(signedLimitSwapMessage, to, data)
      const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
        'metaDelegateCall',
        [signedLimitSwapMessage.signedParams[0].value, signedData, signedLimitSwapMessage.signature, unsignedData]
      )
      return { contract, contractName, functionName, params, paramTypes }
    })

    _setupEthersWrappedTx('deploy', async () => {
      if (await this.isDeployed()) {
        throw new Error(`Account contract already deployed`)
      }
      const bytecode = this._getAccountBytecode()
      const deployer = this._getDeployer()
      return {
        contract: deployer,
        contractName: 'IDeployer',
        functionName: 'deploy',
        params: [bytecode, this._accountDeploymentSalt],
        paramTypes: [
          { name: 'initCode', type: 'bytes' },
          { name: 'salt', type: 'bytes32' }
        ]
      }
    })

    _setupEthersWrappedTx('externalCall', async (value, to, data) => {
      const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
        'externalCall', [value, to, data]
      )
      return { contract, contractName, functionName, params, paramTypes }
    })

    _setupEthersWrappedTx('delegateCall', async (to, data) => {
      const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
        'delegateCall', [to, data]
      )
      return { contract, contractName, functionName, params, paramTypes }
    })

    _setupEthersWrappedTx('metaDelegateCall', async (to, data, signature) => {
      const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
        'metaDelegateCall', [to, data, signature]
      )
      return { contract, contractName, functionName, params, paramTypes }
    })

    _setupEthersWrappedTx('metaDelegateCall', async (to, data, signature, unsignedData) => {
      const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
        'metaDelegateCall', [to, data, signature, unsignedData]
      )
      return { contract, contractName, functionName, params, paramTypes }
    })
  }
  
  async isDeployed () {
    if (!this.address) { throw new Error('Account not loaded') }
    const code = await this._provider.getCode(this.address)
    return code !== '0x'
  }

  getLimitSwapData(signedSwap, to, data) {
    const { 
      functionCall: constructedFunctionCall, 
      numParams 
    } = this.constructLimitSwapFunctionCall(signedSwap, [to, data])
    const { signedData, unsignedData } = splitCallData(encodeFunctionCall(constructedFunctionCall), numParams)
    return { signedData, unsignedData }
  }

  constructLimitSwapFunctionCall(signedMessage, unsignedDataList) {
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
    for (let k = 0; k < unsignedDataList.length; k++) {
      functionCall.params.push(unsignedDataList[k])
    }
    return { functionCall, numParams }
  }

  async nextBit () {
    let bitmapIndex = BN(0)
    let bit = BN(1)
    if (await this.isDeployed()) {
      const account = this.accountContract()
      let curBitmap, curBitmapBinStr
      let curBitmapIndex = -1
      let nextBitIndex = -1
      while(nextBitIndex < 0) {
        curBitmapIndex++
        curBitmap = await account.storageLoad(bitmapPointer(curBitmapIndex))
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
    const account = this.accountContract()
    const bmp = await account.storageLoad(bitmapPointer(bitmapIndex))
    // using bignumber.js here for the base-2 support
    return new BN(bmp)
  }

  async bitUsed (bitmapIndex, bit) {
    const account = this.accountContract()

    if (!await this.isDeployed()) {
      return false
    }

    const bitmap = await account.storageLoad(bitmapPointer(bitmapIndex))
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
        contract: this.accountContract(),
        contractName: 'Account',
        functionName,
        paramTypes: _paramTypesMap[functionName],
        params
      }
    } else {
      if (isDirect) {
        throw new Error(`Function ${functionName} cannot be called before Account deploy`)
      }
      // returns batched deployAndExecute tx

      return {
        contract: this.deployAndExecuteContract(),
        contractName: 'DeployAndExecute',
        functionName: 'deployAndExecute',
        paramTypes: _paramTypesMap['deployAndExecute'],
        params: [
          this._getAccountBytecode(),
          this._accountDeploymentSalt,
          encodeFunctionCall({
            functionName,
            paramTypes: _paramTypesMap[functionName],
            params
          })
        ]
      }
    }
  }

  accountContract() {
    return this._ethersContract('Account', this.address)
  }

  deployAndExecuteContract () {
    return this._ethersContract('DeployAndExecute', this._deployAndExecuteAddress)
  }

  _ethersContract(contractName, contractAddress) {
    return new ethers.Contract(
      contractAddress, _abiMap[contractName], this._signer
    )
  }

  async isProxyOwner (address) {
    if (!await this.isDeployed()) {
      if (!this._initOwnerAddress) {
        throw new Error(`Error: Account.isProxyOwner(): Account not loaded`)
      }
      return address.toLowerCase() == this._initOwnerAddress.toLowerCase()
    } else {
      const account = this.accountContract()
      const proxyOwnerAddress = await account.proxyOwner()
      let isProxyOwner = false
      if (proxyOwnerAddress === address) {
        isProxyOwner = true
      }
      return isProxyOwner
    }
  }

  async implementation () {
    if (!await this.isDeployed()) return ZERO_ADDRESS
    const account = this.accountContract()
    const implementation = await account.implementation()
    return implementation.toLowerCase()
  }

  _getDeployer () {
    if (!this._deployer) {
      if (!this._deployerAddress) {
        throw new Error('Account: deployerAddress not found')
      }
      this._deployer = this._ethersContract('IDeployer', this._deployerAddress)
    }
    return this._deployer
  }

  _getAccountBytecode () {
    const bytecode = computeAccountBytecode(
      this._implementationAddress, this._ownerAddress
    )

    return bytecode
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