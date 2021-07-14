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
const localConfig = require('@brinkninja/environment/config/network.config.local1.json')
const goerliConfig = require('@brinkninja/environment/config/network.config.goerli1.json')
const mainnetConfig = require('@brinkninja/environment/config/network.config.mainnet1.json')

class BrinkSDK {
  constructor (environmentConfiguration) {
    if (typeof environmentConfiguration == 'string') {
      switch(environmentConfiguration) {
        case 'local':
          this.environment = localConfig
          break;
        case 'goerli':
          this.environment = goerliConfig
          break;
        case 'mainnet':
          this.environment = mainnetConfig
          break;
      }
    } else {
      this.environment = environmentConfiguration
    }
    this.accounts = []
    this.accountSigners = []
  }

  newAccount(ethersSigner, signer, accountDeploymentSalt, ethers) {

    const contracts = {}
    for (var i = 0; i < this.environment.deployments.length; i++) {
      contracts[this.environment.deployments[i].name] = this.environment.deployments[i].address;
    }

    const accountSigner = new AccountSigner({
      accountVersion: '1',
      environment: this.environment,
      signer: signer,
      accountDeploymentSalt: accountDeploymentSalt
    })

    const account = new Account({
      implementationAddress: contracts.account,
      ownerAddress: ethersSigner.address,
      accountVersion: '1',
      accountDeploymentSalt: accountDeploymentSalt,
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
