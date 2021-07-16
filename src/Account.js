const computeAccountBytecode = require('./computeAccountBytecode')
const computeAccountAddress = require('./computeAccountAddress')
const { toBN: BN } = require('web3-utils')
const ethJsUtil = require('ethereumjs-util')
const typedDataEIP712 = require('./typedDataEIP712')
const recoverSigner = require('./recoverSigner')
const encodeFunctionCall = require('./encodeFunctionCall')
const { ZERO_ADDRESS } = require('./constants')
const splitCallData = require('@brinkninja/test-helpers/src/splitCallData')


const { 
  verifyTransferEth,
  verifyTransferToken,
  verifyUpgrade
 } = require('./callVerifiers')

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

  async sendLimitSwap(signedEthSwap, to, data) {
    const { signedData, unsignedData } = this.getLimitSwapData(signedEthSwap, to, data)
    const tx = await this.metaPartialSignedDelegateCall(signedEthSwap.signedParams[0].value, signedData, signedEthSwap.signature, unsignedData)
    return tx
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


  // account contract fns

  async externalCall (value, to, data) {
    const tx = await this.sendAccountTransaction('externalCall', [value, to, data])
    return tx
  }

  async delegateCall (to, data) {
    const tx = await this.sendAccountTransaction('delegateCall', [to, data])
    return tx
  }

  async metaDelegateCall (to, data, signature) {
    const tx = await this.sendAccountTransaction('metaDelegateCall', [to, data, signature])
    return tx
  }

  async metaPartialSignedDelegateCall (to, data, signature, unsignedData) {
    const tx = await this.sendAccountTransaction('metaPartialSignedDelegateCall', [to, data, signature, unsignedData])
    return tx
  }

  async transactionInfo(functionName, params = []) {
    const {
      contract,
      name: contractName,
      functionName: txFunctionName,
      paramTypes,
      params: txParams
    } = await this._getTxData(functionName, params)
    const gasEstimate = await contract.estimateGas[txFunctionName].apply(this, txParams)
    return {
      gasEstimate,
      contractName,
      functionName: txFunctionName,
      paramTypes,
      params: txParams
    }
  }

  async sendAccountTransaction (functionName, params = []) {
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
        name: 'Account',
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
        name: 'DeployAndExecute',
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

  async transferEthSuccessCheck (signedFunctionCall) {
    const [ value, to, data ] = signedFunctionCall.params

    verifyTransferEth(value, to, data)

    const ethBalance = BN(await this._ethers.provider.getBalance(this.address))
    if (BN(value).gt(ethBalance)) {
      throw new Error(
        `Can't transferEth. Account has ${ethBalance.toString()} but needs ${value.toString()}`
      )
    }

    return true
  }

  async upgrade(signedFunctionCall) {
    if (!await this.isDeployed()) throw new Error('Error: Account.upgrade(): Account contract not deployed')

    const { call } = signedFunctionCall
    const functionName = call.functionName

    if (functionName !== 'upgradeTo') {
      throw new Error(
        `Expected upgrade delegate function name to be "upgradeTo", but got "${functionName}"`
      )
    }

    await this.upgradeSuccessCheck(signedFunctionCall)

    const promiEvent = await this._metaDelegateCall(signedFunctionCall)
    return promiEvent
  }

  async upgradeSuccessCheck (signedFunctionCall) {
    const { call } = signedFunctionCall
    const [ implementationAddress ] = call.params
    verifyUpgrade(implementationAddress)
    return true
  }

  async implementation () {
    if (!await this.isDeployed()) return ZERO_ADDRESS
    const account = this.accountContract()
    const implementation = await account.implementation()
    return implementation.toLowerCase()
  }

  async transferTokenSuccessCheck (signedFunctionCall) {
    const { params, call } = signedFunctionCall
    const tokenAddress = params[1]
    const [ recipientAddress, amount ] = call.params

    verifyTransferToken(tokenAddress, recipientAddress, amount)

    const token = this._ethersContract('ERC20', tokenAddress)
    const accountBalance = BN(await token.balanceOf(this.address))
    if (BN(amount).gt(accountBalance)) {
      throw new Error(
        `Can't transfer token. Account has ${accountBalance.toString()} but needs ${amount.toString()}`
      )
    }

    return true
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

  async _metaDelegateCall (signedFunctionCall) {
    _verifySignedFunctionName(signedFunctionCall, 'metaDelegateCall')
    const promiEvent = await this._sendSignedTransaction(signedFunctionCall)
    return promiEvent
  }

  async _verifySignedFnCall (signedFunctionCall) {
    if (!this.address) { throw new Error('Account not loaded') }

    const {
      accountAddress, message,
      signature, signer,
      functionName, paramTypes, params,
      call, callEncoded
    } = signedFunctionCall

    const checksumSignerAddr = ethJsUtil.toChecksumAddress(signer)

    if (accountAddress !== this.address) {
      throw new Error(
        `Invalid function call. Wrong account address. Expected ${this.address}, received ${accountAddress}`
      )
    }
  
    const { typedDataHash } = typedDataEIP712({
      accountVersion: this._accountVersion,
      chainId: this._chainId,
      accountAddress,
      functionName,
      paramTypes,
      params
    })

    if (message !== typedDataHash) {
      throw new Error(
        `Invalid function call. Wrong message. Expected ${typedDataHash}, received ${message}`
      )
    }

    const recoveredSigner = recoverSigner({ signature, typedDataHash })
    if (checksumSignerAddr !== recoveredSigner) {
      throw new Error(`Invalid function call. Wrong signer. Expected ${recoveredSigner}, received ${checksumSignerAddr}`)
    }

    // TODO: Add back in 
    // const signerIsOwner = await this.isProxyOwner(signer)
    // if (!signerIsOwner) {
    //   throw new Error(`Invalid function call. signer ${signer} is not account owner ${accountOwner}`)
    // }

    if (call) {
      // signed function includes an encoded call
      const computedCallEncoded = encodeFunctionCall(call)
      if (callEncoded !== computedCallEncoded) {
        throw new Error(
          `Invalid function call. Call encoding is invalid`
        )
      }
    }
  }

  _getFunctionCallData (signedFunctionCall, unsignedParams = []) {
    const { functionName, bitmapIndex, bit, signature, params } = signedFunctionCall
    const txParams = [ bitmapIndex, bit, ...params, signature, ...unsignedParams ]

    // web3 contracts don't like BN types
    // const txParams_noBN = txParams.map(p => p.words ? p.toString() : p)
    const data = encodeFunctionCall(signedFunctionCall)
    return data
  }

  async _sendSignedTransaction (signedFunctionCall, unsignedParams = []) {
    if (!await this.isDeployed()) {
      throw new Error(`Account contract not deployed. Can't send ${signedFunctionCall.functionName} transaction`)
    }
    await this._verifySignedFnCall(signedFunctionCall)

    const data = this._getFunctionCallData(signedFunctionCall, unsignedParams)

    const promiEvent = this._ethersSigner.sendTransaction({
      to: this.address,
      data
    })
    return promiEvent
  }

  _getAccountBytecode () {
    const bytecode = computeAccountBytecode(
      this._implementationAddress, this._ownerAddress, this._chainId
    )

    return bytecode
  }
}

function _verifySignedFunctionName(signedFunctionCall, expectedFunctionName) {
  const { functionName } = signedFunctionCall
  if (functionName !== expectedFunctionName) {
    throw new Error(`Expected "${functionName}" to be "${expectedFunctionName}"`)
  }
}

module.exports = Account