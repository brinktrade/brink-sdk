const Account = require('./Account')
const AccountSigner = require('./AccountSigner')
const MessageEncoder = require('./MessageEncoder')
const PrivateKeySigner = require('./PrivateKeySigner')
const computeAccountAddress = require('./computeAccountAddress')
const computeAccountBytecode = require('./computeAccountBytecode')
const computeInitBytecode = require('./computeInitBytecode')
const computeCreate2Address = require('./computeCreate2Address')
const constants = require('./constants')
const isAddress = require('./utils/isAddress')
const typedDataEIP712 = require('./typedDataEIP712')
const recoverSigner = require('./recoverSigner')
const decodeExecuteCallData = require('./decodeExecuteCallData')
const { loadEnvironment } = require('@brinkninja/environment')

class BrinkSDK {
  constructor (environmentConfiguration) {
    if (typeof environmentConfiguration == 'string') {
      this.environment = loadEnvironment(environmentConfiguration)
    } else {
      this.environment = environmentConfiguration
    }
    this.accounts = []
    this.accountSigners = []
  }

  newAccount(ethersSigner, signer, ethers) {

    const contracts = {}
    for (var i = 0; i < this.environment.deployments.length; i++) {
      contracts[this.environment.deployments[i].name] = this.environment.deployments[i].address;
    }

    const accountSigner = new AccountSigner({
      accountVersion: this.environment.accountVersion,
      environment: this.environment,
      signer: signer,
      accountDeploymentSalt: this.environment.accountDeploymentSalt
    })

    const account = new Account({
      implementationAddress: contracts.account,
      ownerAddress: ethersSigner.address,
      accountVersion: this.environment.accountVersion,
      accountDeploymentSalt: this.environment.accountDeploymentSalt,
      chainId: this.environment.chainId,
      ethers: ethers,
      ethersSigner: ethersSigner,
      deployerAddress: contracts.singletonFactory,
      deployAndExecuteAddress: contracts.deployAndExecute
    })

    return { account: account, accountSigner: accountSigner }
  }
}

module.exports = {
  Account,
  AccountSigner,
  MessageEncoder,
  PrivateKeySigner,
  computeAccountAddress,
  computeAccountBytecode,
  computeInitBytecode,
  computeCreate2Address,
  constants,
  isAddress,
  typedDataEIP712,
  recoverSigner,
  decodeExecuteCallData,
  BrinkSDK
}
