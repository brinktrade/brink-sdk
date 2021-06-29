const computeAccountBytecode = require('./computeAccountBytecode')
const computeAccountAddress = require('./computeAccountAddress')
const { toBN: BN, padLeft } = require('web3-utils')
const ethJsUtil = require('ethereumjs-util')
const typedDataEIP712 = require('./typedDataEIP712')
const recoverSigner = require('./recoverSigner')
const encodeFunctionCall = require('./encodeFunctionCall')
const Transfer = require('./Transfer')
const { ZERO_ADDRESS, swapFunctionNames, transferTypes } = require('./constants')


const { 
  verifyTransferEth,
  verifyTransferToken,
  verifyUpgrade
 } = require('./callVerifiers')


const _abiMap = {
  Account: require('./contracts/Account.abi'),
  IDeployer: require('./contracts/IDeployer.abi'),
  DeployAndExecute: require('./contracts/DeployAndExecute.abi'),
  ERC20: require('./contracts/ERC20.abi')
}

class Account {
  constructor ({
    accountVersion,
    accountDeploymentSalt,
    chainId,
    ethers,
    ethersSigner,
    deployerAddress,
    deployAndExecuteAddress
  }) {
    this._accountVersion = accountVersion
    this._accountDeploymentSalt = accountDeploymentSalt
    this._chainId = chainId
    this._ethers = ethers
    this._ethersSigner = ethersSigner
    this._deployerAddress = deployerAddress
    this._deployAndExecuteAddress = deployAndExecuteAddress
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

  async loadFromParams(implementationAddress, ownerAddress) {
    this._initImplementationAddress = implementationAddress
    this._initOwnerAddress = ownerAddress
    this.owner = this._initOwnerAddress.toLowerCase()

    this.address = computeAccountAddress(
      this._deployerAddress,
      implementationAddress,
      ownerAddress,
      this._chainId,
      this._accountDeploymentSalt
    )

    this._accountImpl = this._ethersContract('Account', implementationAddress)
  }

  async loadFromAddress(address) {
    this.address = address

    if (!await this.isDeployed()) {
      throw new Error(`Error: Account.loadFromAddress(): No code at contract address ${address}`)
    }

    const account = await this.account()
    const implAddress = await account.implementation()
    this._accountImpl = this._ethersContract('Account', implAddress)
  }

  async loadAndDeploy (implementationAddress, ownerAddress) {
    this.loadFromParams(implementationAddress, ownerAddress)
    const promiEvent = await this.deploy()
    return promiEvent
  }

  async account () {
    if (!this._account && this.address && await this.isDeployed()) {
      this._account = this._ethersContract('Account', this.address)
    }
    return this._account
  }

  async isProxyOwner (address) {
    if (!await this.isDeployed()) {
      if (!this._initOwnerAddress) {
        throw new Error(`Error: Account.isProxyOwner(): Account not loaded`)
      }
      return address.toLowerCase() == this._initOwnerAddress.toLowerCase()
    } else {
      const account = await this.account()
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
    const account = await this.account()
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

  _getDeployAndExecute () {
    if (!this._deployAndExecute) {
      if (!this._deployAndExecuteAddress) {
        throw new Error('Account: _deployAndExecuteAddress not found')
      }
      this._deployAndExecute = this._ethersContract('DeployAndExecute', this._deployAndExecuteAddress)
    }
    return this._deployAndExecute
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
    if (!this._initImplementationAddress || !this._initOwnerAddress) {
      throw new Error(
        `Error: Account._getAccountBytecode(): no implementation address or owner address. Use loadFromParams()`
      )
    }

    const bytecode = computeAccountBytecode(
      this._initImplementationAddress, this._initOwnerAddress, this._chainId
    )

    return bytecode
  }

  _ethersContract(contractName, contractAddress) {
    return new this._ethers.Contract(
      contractAddress, _abiMap[contractName], this._ethersSigner
    )
  }
}

function _verifySignedFunctionName(signedFunctionCall, expectedFunctionName) {
  const { functionName } = signedFunctionCall
  if (functionName !== expectedFunctionName) {
    throw new Error(`Expected "${functionName}" to be "${expectedFunctionName}"`)
  }
}

module.exports = Account