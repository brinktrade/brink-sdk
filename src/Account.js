const computeAccountBytecode = require('./computeAccountBytecode')
const computeAccountAddress = require('./computeAccountAddress')
const encodeFunctionCall = require('./encodeFunctionCall')
const { ZERO_ADDRESS } = require('./constants')

const _directCalls = [
  'externalCall',
  'delegateCall'
]

const _metaCalls = [
  'metaDelegateCall',
  'metaPartialSignedDelegateCall'
]

const _paramTypesMap = {
  'metaDelegateCall': [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes' },
    { name: 'signature', type: 'bytes' }
  ],
  'metaPartialSignedDelegateCall': [
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
    implementationAddress,
    ownerAddress,
    accountVersion,
    accountDeploymentSalt,
    chainId,
    ethers,
    ethersSigner,
    deployerAddress,
    deployAndExecuteAddress,
  }) {
    this._implementationAddress = implementationAddress
    this._ownerAddress = ownerAddress
    this._accountVersion = accountVersion
    this._accountDeploymentSalt = accountDeploymentSalt
    this._chainId = chainId
    this._ethers = ethers
    this._ethersSigner = ethersSigner
    this._deployerAddress = deployerAddress
    this._deployAndExecuteAddress = deployAndExecuteAddress

    this.address = computeAccountAddress(
      this._deployerAddress,
      this._implementationAddress,
      this._ownerAddress,
      this._chainId,
      this._accountDeploymentSalt
    )

    this._accountImpl = this._ethersContract('Account', implementationAddress)

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
        return { contract, contractName, functionName, paramTypes, params, gas }
      }).bind(this)

      this.populateTransaction[fnName] = (async function () {
        const { contract, contractName, functionName, paramTypes, params } = await fn.apply(this, arguments)
        const txData = await contract.populateTransaction[functionName].apply(contract, params)
        return {
          contract, contractName, functionName, paramTypes, params,
          ...txData
        }
      }).bind(this)

      this.callStatic[fnName] = (async function () {
        const { contract, contractName, functionName, paramTypes, params } = await fn.apply(this, arguments)
        const returnValues = await contract.callStatic[functionName].apply(contract, params)
        return { contract, contractName, functionName, paramTypes, params, returnValues }
      }).bind(this)
    }

    _setupEthersWrappedTx('sendLimitSwap', async (signedLimitSwapMessage, to, data) => {
      const { signedData, unsignedData } = this.getLimitSwapData(signedLimitSwapMessage, to, data)
      const { contract, contractName, functionName, params, paramTypes } = await this._getTxData(
        'metaPartialSignedDelegateCall',
        [signedLimitSwapMessage.signedParams[0].value, signedData, signedLimitSwapMessage.signature, unsignedData]
      )
      return { contract, contractName, functionName, params, paramTypes }
    })
  }

  async deploy () {
    if (await this.isDeployed()) {
      throw new Error(`Error: Account.deploy(): Account contract already deployed`)
    }
    const bytecode = this._getAccountBytecode()
    const deployer = this._getDeployer()
    const promiEvent = deployer.deploy(bytecode, this._accountDeploymentSalt)
    return promiEvent
  }

  async isDeployed () {
    if (!this.address) { throw new Error('Error: Account.isDeployed(): Account not loaded') }
    const code = await this._ethers.provider.getCode(this.address)
    return code !== '0x'
  }

  // verifier calls

  // async sendLimitSwap(signedEthSwap, to, data) {
  //   const { signedData, unsignedData } = this.getLimitSwapData(signedEthSwap, to, data)
  //   const tx = await this.metaPartialSignedDelegateCall(signedEthSwap.signedParams[0].value, signedData, signedEthSwap.signature, unsignedData)
  //   return tx
  // }

  getLimitSwapData(signedSwap, to, data) {
    const { 
      functionCall: constructedFunctionCall, 
      numParams 
    } = this.constructLimitSwapFunctionCall(signedSwap, [to, data])
    // console.log('constructedFunctionCall: ', constructedFunctionCall)
    // console.log('numParams: ', numParams)
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


  // account contract fns

  async externalCall (value, to, data) {
    const tx = await this._sendAccountTransaction('externalCall', [value, to, data])
    return tx
  }

  async delegateCall (to, data) {
    const tx = await this._sendAccountTransaction('delegateCall', [to, data])
    return tx
  }

  async metaDelegateCall (to, data, signature) {
    const tx = await this._sendAccountTransaction('metaDelegateCall', [to, data, signature])
    return tx
  }

  async metaPartialSignedDelegateCall (to, data, signature, unsignedData) {
    const tx = await this._sendAccountTransaction('metaPartialSignedDelegateCall', [to, data, signature, unsignedData])
    return tx
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
    return new this._ethers.Contract(
      contractAddress, _abiMap[contractName], this._ethersSigner
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
      const proxyOwnerAddress = await this._account.proxyOwner()
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
      this._implementationAddress, this._ownerAddress, this._chainId
    )

    return bytecode
  }
}

// splits a call for metaPartialSignedDelegateCall into signedData and unsignedData
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

module.exports = Account