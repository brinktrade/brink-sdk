const ethJsUtil = require('ethereumjs-util')
const { toBN: BN, padLeft } = require('web3-utils')
const truffleContract = require('@truffle/contract')
const Swap = require('./Swap')
const Transfer = require('./Transfer')
const { ZERO_ADDRESS, swapFunctionNames, transferTypes } = require('./constants')
const typedDataEIP712 = require('./typedDataEIP712')
const recoverSigner = require('./recoverSigner')
const encodeFunctionCall = require('./encodeFunctionCall')
const computeAccountAddress = require('./computeAccountAddress')
const computeAccountBytecode = require('./computeAccountBytecode')
const {
  verifyTransferEth,
  verifyTransferToken,
  verifyUpgrade,
  verifyAddProxyOwner
} = require('./callVerifiers')

const _abiMap = {
  AccountLogic: require('./contracts/AccountLogic.abi'),
  SingletonFactory: require('./contracts/SingletonFactory.abi'),
  DeployAndExecute: require('./contracts/DeployAndExecute.abi'),
  ERC20: require('./contracts/ERC20.abi')
}

class AccountOld {
  
  constructor ({
    accountVersion,
    accountDeploymentSalt,
    chainId,
    web3,
    web3Sender,
    deployerAddress,
    create2CallerAddress,
    deployAndExecuteAddress
  }) {
    this._accountVersion = accountVersion
    this._accountDeploymentSalt = accountDeploymentSalt
    this._chainId = chainId
    this._web3 = web3
    this._web3Sender = web3Sender
    this._deployerAddress = deployerAddress
    this._create2CallerAddress = create2CallerAddress || deployerAddress
    this._deployAndExecuteAddress = deployAndExecuteAddress
  }

  async loadFromParams(implementationAddress, ownerAddress) {
    this._initImplementationAddress = implementationAddress
    this._initOwnerAddress = ownerAddress
    this.owner = this._initOwnerAddress.toLowerCase()

    this.address = computeAccountAddress(
      this._create2CallerAddress,
      implementationAddress,
      ownerAddress,
      this._chainId,
      this._accountDeploymentSalt
    )

    this._accountLogicImpl = this._web3Contract('AccountLogic', implementationAddress)
  }

  async loadFromAddress(address) {
    this.address = address

    if (!await this.isDeployed()) {
      throw new Error(`Error: Account.loadFromAddress(): No code at contract address ${address}`)
    }

    const accountLogic = await this.accountLogic()
    const implAddress = await accountLogic.methods.implementation().call()
    this._accountLogicImpl = this._web3Contract('AccountLogic', implAddress)
  }

  async loadAndDeploy (implementationAddress, ownerAddress) {
    this.loadFromParams(implementationAddress, ownerAddress)
    const promiEvent = await this.deploy()
    return promiEvent
  }

  async deploy () {
    if (await this.isDeployed()) {
      throw new Error(`Error: Account.deploy(): Account contract already deployed`)
    }

    const bytecode = this._getAccountBytecode()
    const deployer = this._getDeployer()
    const data = deployer.methods.deploy(bytecode, this._accountDeploymentSalt).encodeABI()
    const promiEvent = this._web3Sender.send({
      to: deployer.options.address,
      data
    })
    return promiEvent
  }

  async deployAndSwap (signedFunctionCall, swapAdapterAddress) {
    if (await this.isDeployed()) {
      throw new Error(`Error: Account.deployAndSwap(): Account contract already deployed`)
    }

    const bytecode = this._getAccountBytecode()
    const deployAndExecute = this._getDeployAndExecute()

    const swap = this._getSwap(signedFunctionCall)
    const { error: swapExecutionErr } = await swap.canExecute(swapAdapterAddress)
    if (swapExecutionErr) {
      throw new Error(swapExecutionErr)
    }

    const unsignedParams = [ swapAdapterAddress, swap.getAdapterCallData() ]

    await this._verifySignedFnCall(signedFunctionCall)
    const swapCallData = this._getFunctionCallData(signedFunctionCall, unsignedParams)

    const data = deployAndExecute.methods.deployAndExecute(
      bytecode, this._accountDeploymentSalt, swapCallData
    ).encodeABI()

    const promiEvent = this._web3Sender.send({
      to: deployAndExecute.options.address,
      data
    })
    return promiEvent
  }

  async deployAndTransfer (signedFunctionCall) {
    if (await this.isDeployed()) {
      throw new Error(`Error: Account.deployAndTransfer(): Account contract already deployed`)
    }

    const bytecode = this._getAccountBytecode()
    const deployAndExecute = this._getDeployAndExecute()

    await this._verifySignedFnCall(signedFunctionCall)
    const callData = this._getFunctionCallData(signedFunctionCall)

    const transfer = new Transfer({ web3: this._web3, signedFunctionCall })
    if (transfer.type() == transferTypes.ETH) {
      await this.transferEthSuccessCheck(signedFunctionCall)
    } else if (transfer.type() == transferTypes.TOKEN) {
      await this.transferTokenSuccessCheck(signedFunctionCall)
    } else {
      throw new Error(`Error: Account.deployAndTransfer(): transfer type unknown`)
    }

    const data = deployAndExecute.methods.deployAndExecute(
      bytecode, this._accountDeploymentSalt, callData
    ).encodeABI()

    const promiEvent = this._web3Sender.send({
      to: deployAndExecute.options.address,
      data
    })
    return promiEvent
  }

  async deployAndCall (signedFunctionCall) {
    if (await this.isDeployed()) {
      throw new Error(`Error: Account.deployAndCall(): Account contract already deployed`)
    }

    const bytecode = this._getAccountBytecode()
    const deployAndExecute = this._getDeployAndExecute()

    await this._verifySignedFnCall(signedFunctionCall)
    const callData = this._getFunctionCallData(signedFunctionCall)

    const data = deployAndExecute.methods.deployAndExecute(
      bytecode, this._accountDeploymentSalt, callData
    ).encodeABI()

    const promiEvent = this._web3Sender.send({
      to: deployAndExecute.options.address,
      data
    })
    return promiEvent
  }

  async transferEth (signedFunctionCall) {
    if (!await this.isDeployed()) throw new Error('Error: Account.transferEth(): Account contract not deployed')

    await this.transferEthSuccessCheck(signedFunctionCall)

    const promiEvent = await this._executeCall(signedFunctionCall)
    return promiEvent
  }

  async transferToken (signedFunctionCall) {
    if (!await this.isDeployed()) throw new Error('Error: Account.transferToken(): Account contract not deployed')

    await this.transferTokenSuccessCheck(signedFunctionCall)

    const promiEvent = await this._executeCall(signedFunctionCall)
    return promiEvent
  }

  async tokenToTokenSwap (signedFunctionCall, swapAdapterAddress) {
    const promiEvent = await this._executeSwap(
      swapFunctionNames.tokenToTokenSwap, signedFunctionCall, swapAdapterAddress
    )
    return promiEvent
  }
  
  async ethToTokenSwap (signedFunctionCall, swapAdapterAddress) {
    const promiEvent =  await this._executeSwap(
      swapFunctionNames.ethToTokenSwap, signedFunctionCall, swapAdapterAddress
    )
    return promiEvent
  }

  async tokenToEthSwap (signedFunctionCall, swapAdapterAddress) {
    const promiEvent = await this._executeSwap(
      swapFunctionNames.tokenToEthSwap, signedFunctionCall, swapAdapterAddress
    )
    return promiEvent
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

    const promiEvent = await this._executeDelegateCall(signedFunctionCall)
    return promiEvent
  }
  
  async addProxyOwner(signedFunctionCall) {
    if (!await this.isDeployed()) throw new Error('Error: Account.addProxyOwner(): Account contract not deployed')

    const { call } = signedFunctionCall
    const functionName = call.functionName

    if (functionName !== 'addProxyOwner') {
      throw new Error(
        `Expected addProxyOwner delegate function name to be "addProxyOwner", but got "${functionName}"`
      )
    }

    await this.addProxyOwnerSuccessCheck(signedFunctionCall)

    const promiEvent = await this._executeDelegateCall(signedFunctionCall)
    return promiEvent
  }

  async cancelTransaction(signedFunctionCall) {
    if (!await this.isDeployed()) throw new Error('Error: Account.cancelTransaction(): Account contract not deployed')

    _verifySignedFunctionName(signedFunctionCall, 'cancel')

    await this.cancelSuccessCheck(signedFunctionCall)

    const promiEvent = await this._sendSignedTransaction(signedFunctionCall)
    return promiEvent
  }

  async transferEthSuccessCheck (signedFunctionCall) {
    const [ value, to, data ] = signedFunctionCall.params

    verifyTransferEth(value, to, data)

    const ethBalance = BN(await this._web3.eth.getBalance(this.address))
    if (BN(value).gt(ethBalance)) {
      throw new Error(
        `Can't transferEth. Account has ${ethBalance.toString()} but needs ${value.toString()}`
      )
    }

    return true
  }

  async transferTokenSuccessCheck (signedFunctionCall) {
    const { params, call } = signedFunctionCall
    const tokenAddress = params[1]
    const [ recipientAddress, amount ] = call.params

    verifyTransferToken(tokenAddress, recipientAddress, amount)

    const token = this._web3Contract('ERC20', tokenAddress)
    const accountBalance = BN(await token.methods.balanceOf(this.address).call())
    if (BN(amount).gt(accountBalance)) {
      throw new Error(
        `Can't transfer token. Account has ${accountBalance.toString()} but needs ${amount.toString()}`
      )
    }

    return true
  }

  async upgradeSuccessCheck (signedFunctionCall) {
    const { call } = signedFunctionCall
    const [ implementationAddress ] = call.params
    verifyUpgrade(implementationAddress)
    return true
  }

  async addProxyOwnerSuccessCheck (signedFunctionCall) {
    const { call } = signedFunctionCall
    const [ newOwnerAddress ] = call.params
    verifyAddProxyOwner(newOwnerAddress)
    return true
  }

  async cancelSuccessCheck (signedFunctionCall) {
    const { bitmapIndex, bit } = signedFunctionCall
    const bitUsed = await this.bitUsed(bitmapIndex, bit)
    if (bitUsed) {
      const bitStr = `${bitmapIndex.toString()}:${bit.toString()}`
      throw new Error(`Cancel cannot be executed, bit ${bitStr} has been used`)
    }
    return true
  }

  async isProxyOwner (address) {
    if (!await this.isDeployed()) {
      if (!this._initOwnerAddress) {
        throw new Error(`Error: Account.isProxyOwner(): Account not loaded`)
      }
      return address.toLowerCase() == this._initOwnerAddress.toLowerCase()
    } else {
      const accountLogic = await this.accountLogic()
      const isProxyOwner = await accountLogic.methods.isProxyOwner(address).call()
      return isProxyOwner
    }
  }

  async implementation () {
    if (!await this.isDeployed()) return ZERO_ADDRESS
    const accountLogic = await this.accountLogic()
    const implementation = await accountLogic.methods.implementation().call()
    return implementation
  }

  async isDeployed () {
    if (!this.address) { throw new Error('Error: Account.isDeployed(): Account not loaded') }
    const code = await this._web3.eth.getCode(this.address)
    return code !== '0x'
  }

  async bitmap (bitmapIndex) {
    let bitmap = BN(0)
    if (await this.isDeployed()) {
      const accountLogic = await this.accountLogic()
      bitmap = BN(
        await accountLogic.methods.getReplayProtectionBitmap(bitmapIndex.toString()).call()
      )
    }
    return bitmap
  }

  async nextBit () {
    let bitmapIndex = BN(0)
    let bit = BN(1)
    if (await this.isDeployed()) {
      const accountLogic = await this.accountLogic()
      let curBitmap, curBitmapBinStr
      let curBitmapIndex = -1
      let nextBitIndex = -1
      while(nextBitIndex < 0) {
        curBitmapIndex++
        curBitmap = await accountLogic.methods.getReplayProtectionBitmap(curBitmapIndex).call()
        curBitmapBinStr = padLeft(BN(curBitmap).toString(2), 256, '0')
        curBitmapBinStr = curBitmapBinStr.split("").reverse().join("")
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

  async bitUsed (bitmapIndex, bit) {
    let bitUsed = false
    if (await this.isDeployed()) {
      const accountLogic = await this.accountLogic()
      bitUsed = await accountLogic.methods.replayProtectionBitUsed(
        bitmapIndex.toString(),
        bit.toString()
      ).call()
    }
    return bitUsed
  }

  async accountLogic () {
    if (!this._accountLogic && this.address && await this.isDeployed()) {
      this._accountLogic = this._web3Contract('AccountLogic', this.address)
    }
    return this._accountLogic
  }

  async _executeCall (signedFunctionCall) {
    _verifySignedFunctionName(signedFunctionCall, 'executeCall')
    const promiEvent = await this._sendSignedTransaction(signedFunctionCall)
    return promiEvent
  }

  async _executeDelegateCall (signedFunctionCall) {
    _verifySignedFunctionName(signedFunctionCall, 'executeDelegateCall')
    const promiEvent = await this._sendSignedTransaction(signedFunctionCall)
    return promiEvent
  }

  async _executeSwap (swapFunctionName, signedFunctionCall, swapAdapterAddress) {
    if (!await this.isDeployed()) throw new Error(`Error: Account.${swapFunctionName}(): Account contract not deployed`)

    _verifySignedFunctionName(signedFunctionCall, swapFunctionName)

    const swap = this._getSwap(signedFunctionCall)
    const { error: swapExecutionErr } = await swap.canExecute(swapAdapterAddress)
    if (swapExecutionErr) {
      throw new Error(swapExecutionErr)
    }

    const unsignedParams = [ swapAdapterAddress, swap.getAdapterCallData() ]

    const promiEvent = await this._sendSignedTransaction(
      signedFunctionCall, unsignedParams
    )
    return promiEvent
  }

  async _sendSignedTransaction (signedFunctionCall, unsignedParams = []) {
    if (!await this.isDeployed()) {
      throw new Error(`Account contract not deployed. Can't send ${signedFunctionCall.functionName} transaction`)
    }
    await this._verifySignedFnCall(signedFunctionCall)

    const data = this._getFunctionCallData(signedFunctionCall, unsignedParams)

    const promiEvent = this._web3Sender.send({
      to: this.address,
      data
    })
    return promiEvent
  }

  _getFunctionCallData (signedFunctionCall, unsignedParams = []) {
    const { functionName, bitmapIndex, bit, signature, params } = signedFunctionCall
    const txParams = [ bitmapIndex, bit, ...params, signature, ...unsignedParams ]

    // web3 contracts don't like BN types
    const txParams_noBN = txParams.map(p => p.words ? p.toString() : p)

    const data = this._accountLogicImpl.methods[functionName].apply(this, txParams_noBN).encodeABI()

    return data
  }

  async _verifySignedFnCall (signedFunctionCall) {
    if (!this.address) { throw new Error('Account not loaded') }

    const {
      accountAddress, message,
      signature, signer,
      functionName, bitmapIndex, bit, paramTypes, params,
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
      bitmapIndex,
      bit,
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

    const signerIsOwner = await this.isProxyOwner(signer)
    if (!signerIsOwner) {
      throw new Error(`Invalid function call. signer ${signer} is not account owner ${accountOwner}`)
    }

    const bitUsed = await this.bitUsed(bitmapIndex, bit)
    if (bitUsed) {
      const bitStr = `${bitmapIndex.toString()}:${bit.toString()}`
      throw new Error(`Invalid function call. bit ${bitStr} has been used`)
    }

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

  _getSwap (signedFunctionCall) {
    return new Swap({
      web3: this._web3,
      signedFunctionCall
    })
  }

  _getDeployer () {
    if (!this._deployer) {
      if (!this._deployerAddress) {
        throw new Error('Account: deployerAddress not found')
      }
      this._deployer = this._web3Contract('SingletonFactory', this._deployerAddress)
    }
    return this._deployer
  }

  _getDeployAndExecute () {
    if (!this._deployAndExecute) {
      if (!this._deployAndExecuteAddress) {
        throw new Error('Account: _deployAndExecuteAddress not found')
      }
      this._deployAndExecute = this._web3Contract('DeployAndExecute', this._deployAndExecuteAddress)
    }
    return this._deployAndExecute
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

  _web3Contract(contractName, contractAddress) {
    return new this._web3.eth.Contract(_abiMap[contractName], contractAddress)
  }

  async _latestBlock () {
    const block = await this._web3.eth.getBlock('latest')
    return new BN(block.number)
  }
}

function _verifySignedFunctionName(signedFunctionCall, expectedFunctionName) {
  const { functionName } = signedFunctionCall
  if (functionName !== expectedFunctionName) {
    throw new Error(`Expected "${functionName}" to be "${expectedFunctionName}"`)
  }
}

module.exports = AccountOld
