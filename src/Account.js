const _ = require('lodash')
const { ethers } = require('ethers')
const { padLeft } = require('web3-utils')
const BigNumber = require('bignumber.js')
const computeAccountBytecode = require('./computeAccountBytecode')
const computeAccountAddress = require('./computeAccountAddress')
const encodeFunctionCall = require('./encodeFunctionCall')
const { ZERO_ADDRESS } = require('./constants')
const bitmapPointer = require('./utils/bitmapPointer')
const { signEIP712, constants } = require('@brinkninja/utils')
const { MAX_UINT256 } = constants
const {
  verifyTokenToTokenSwap,
  verifyEthToTokenSwap,
  verifyTokenToEthSwap
} = require('./callVerifiers')
const {
  metaDelegateCallSignedParamTypes
} = require('./constants')
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
    this._accountVersion = this._environment.accountVersion
    this._accountDeploymentSalt = this._environment.accountDeploymentSalt
    this._provider = provider
    this._signer = signer
    this._chainId = environment.chainId
    this._deployerAddress = _.find(this._environment.deployments, { name: 'singletonFactory' }).address
    this._deployAndExecuteAddress = _.find(this._environment.deployments, { name: 'deployAndExecute' }).address

    if (typeof ownerAddress !== `undefined`) {
      this._ownerAddress = ownerAddress
      this.address = computeAccountAddress(
        this._deployerAddress,
        this._implementationAddress,
        this._ownerAddress,
        this._accountDeploymentSalt
      )
      this._accountImpl = this._ethersContract('Account', this._implementationAddress)
    }

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

    _setupEthersWrappedTx('cancel', async (signedCancelMessage) => {
      return this._metaDelegateHelper(signedCancelMessage)
    })

    _setupEthersWrappedTx('transferEth', async (signedTransferEthMessage) => {
      return this._metaDelegateHelper(signedTransferEthMessage)
    })

    _setupEthersWrappedTx('transferToken', async (signedTransferTokenMessage) => {
      return this._metaDelegateHelper(signedTransferTokenMessage)
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

  async _metaDelegateHelper (signedMessage) {
    const toAddress = signedMessage.signedParams[0].value
    const signedData = signedMessage.signedParams[1].value
    const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
      'metaDelegateCall',
      [toAddress, signedData, signedMessage.signature, '0x']
    )
    return { contract, contractName, functionName, params, paramTypes }
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
    if (await this.isDeployed()) {
      const account = this.accountContract()
      const bmp = await account.storageLoad(bitmapPointer(bitmapIndex))
      // using bignumber.js here for the base-2 support
      return BN(bmp)
    } else {
      return BN(0)
    }
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

  async accountAddress () {
    const addr = computeAccountAddress(
      this._findContractAddress('singletonFactory'),
      this._findContractAddress('account'),
      await this.signerAddress(),
      this._environment.accountDeploymentSalt
    )
    return addr
  }

  async signerAddress () {
    const addr = await this._signer.getAddress()
    return addr
  }

  async signCancel(bitmapIndex, bit) {
    const call = {
      functionName: 'cancel',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'}
      ],
      params: [bitmapIndex, bit]
    }

    const signedCall = await this.signMetaDelegateCall(
      this._findContractAddress('cancelVerifier'), call
    )

    return signedCall
  }

  async signEthTransfer(bitmapIndex, bit, recipient, amount, expiryBlock=MAX_UINT256) {
    const call = {
      functionName: 'ethTransfer',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'recipient', type: 'address'},
        { name: 'amount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'}
      ],
      params: [bitmapIndex, bit, recipient, amount, expiryBlock]
    }

    const signedCall = await this.signMetaDelegateCall(
      this._findContractAddress('transferVerifier'), call
    )
    return signedCall
  }

  async signTokenTransfer(bitmapIndex, bit, tokenAddress, recipient, amount, expiryBlock=MAX_UINT256) {
    const call = {
      functionName: 'tokenTransfer',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'token', type: 'address'},
        { name: 'recipient', type: 'address'},
        { name: 'amount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'}
      ],
      params: [bitmapIndex, bit, tokenAddress, recipient, amount, expiryBlock]
    }

    const signedCall = await this.signMetaDelegateCall(
      this._findContractAddress('transferVerifier'), call
    )
    return signedCall
  }

  async signEthToTokenSwap(bitmapIndex, bit, tokenAddress, ethAmount, tokenAmount, expiryBlock = MAX_UINT256) {
    verifyEthToTokenSwap(tokenAddress, ethAmount, tokenAmount, expiryBlock)
    const call = {
      functionName: 'ethToToken',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'token', type: 'address'},
        { name: 'ethAmount', type: 'uint256'},
        { name: 'tokenAmount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'},
        { name: 'to', type: 'address'},
        { name: 'data', type: 'bytes'}
      ],
      params: [
        bnToStr(bitmapIndex), bnToStr(bit), tokenAddress, bnToStr(ethAmount), bnToStr(tokenAmount),
        bnToStr(expiryBlock)
      ]
    }

    const signedCall = await this.signMetaDelegateCall(
      this._findContractAddress('limitSwapVerifier'), call
    )
    return signedCall
  }

  async signTokenToEthSwap(bitmapIndex, bit, tokenAddress, tokenAmount, ethAmount, expiryBlock = MAX_UINT256) {
    verifyTokenToEthSwap(tokenAddress, tokenAddress, ethAmount, expiryBlock)
    const call = {
      functionName: 'tokenToEth',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'token', type: 'address'},
        { name: 'tokenAmount', type: 'uint256'},
        { name: 'ethAmount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'},
        { name: 'to', type: 'address'},
        { name: 'data', type: 'bytes'}
      ],
      params: [
        bnToStr(bitmapIndex), bnToStr(bit), tokenAddress, bnToStr(tokenAmount), bnToStr(ethAmount),
        bnToStr(expiryBlock)
      ]
    }

    const signedCall = await this.signMetaDelegateCall(
      this._findContractAddress('limitSwapVerifier'), call
    )
    return signedCall
  }

  async signTokenToTokenSwap(bitmapIndex, bit, tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock = MAX_UINT256) {
    verifyTokenToTokenSwap(tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock)
    const call = {
      functionName: 'tokenToToken',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'tokenIn', type: 'address'},
        { name: 'tokenOut', type: 'address'},
        { name: 'tokenInAmount', type: 'uint256'},
        { name: 'tokenOutAmount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'},
        { name: 'to', type: 'address'},
        { name: 'data', type: 'bytes'}
      ],
      params: [
        bnToStr(bitmapIndex), bnToStr(bit), tokenInAddress, tokenOutAddress, bnToStr(tokenInAmount),
        bnToStr(tokenOutAmount), bnToStr(expiryBlock)
      ]
    }

    const signedCall = await this.signMetaDelegateCall(
      this._findContractAddress('limitSwapVerifier'), call
    )
    return signedCall
  }

  async signMetaDelegateCall (toAddress, call) {
    const signedFnCall = await this.signFunctionCall(
      'metaDelegateCall',
      metaDelegateCallSignedParamTypes,
      [ toAddress, call ]
    )
    return signedFnCall
  }

  async signFunctionCall (functionName, paramTypes, params) {
    let encodedParams = []
    for (let i in params) {
      const typeData = paramTypes[i]
      if (typeData.calldata) {
        const callEncoded = encodeFunctionCall(params[i])
        encodedParams[i] = callEncoded
      } else {
        encodedParams[i] = params[i].toString()
      }
    }

    const { typedData, typedDataHash, signature } = await signEIP712({
      signer: this._signer,
      contractAddress: await this.accountAddress(),
      contractName: 'BrinkAccount',
      contractVersion: this._accountVersion,
      chainId: this._chainId,
      method: functionName,
      paramTypes,
      params: encodedParams
    })

    const signerAddress = await this._signer.getAddress()

    return {
      message: typedDataHash,
      EIP712TypedData: typedData,
      signature,
      signer: signerAddress,
      accountAddress: await this.accountAddress(),
      functionName,
      signedParams: parseParams(paramTypes, params)
    }
  }

  _findContractAddress (contractName) {
    return _.find(this._environment.deployments, { name: contractName }).address
  }
}

function parseParams (paramTypes, params) {
  let paramsArray = []
  for (let i in paramTypes) {
    const { name, type, calldata } = paramTypes[i]
    paramsArray[i] = {
      name,
      type
    }
    if (calldata) {
      paramsArray[i].value = encodeFunctionCall(params[i])
      paramsArray[i].callData = {
        functionName: params[i].functionName,
        params: parseParams(params[i].paramTypes, params[i].params)
      }
    } else {
      paramsArray[i].value = params[i]
    }
  }
  return paramsArray
}

function bnToStr (bnOrString) {
  return bnOrString.toString()
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