const _ = require('lodash')
const { loadEnvironment } = require('@brinkninja/environment')
const Account = require('./src/Account')
const computeAccountAddress = require('./src/computeAccountAddress')
const recoverSigner = require('./src/recoverSigner')

class BrinkSDK {

  // environment: @brinkninja/environment network string or configuration object
  // ethers: ethers.js instance
  // signer: ethers.js signer (options, uses provider.signer by default)
  constructor (environment) {
    if (!environment) throw new Error(`no environment specified`)
    if (typeof environment == 'string') {
      this.environment = loadEnvironment(environment)
    } else {
      this.environment = environment
    }
  }

  async account ({ ownerAddress, provider, signer }) {
    let accountTxSigner
    let accountTxProvider
    if (!provider && !signer) {
      throw new Error(`no provider or signer specified`)
    } else if (!provider) {
      accountTxProvider = signer.provider
      accountTxSigner = signer
    } else if (!signer) {
      accountTxSigner = provider.getSigner()
      accountTxProvider = provider
    } else {
      accountTxSigner = signer
      accountTxProvider = provider
    }

    let accountOwnerAddress
    if (!ownerAddress) {
      accountOwnerAddress = await signer.getAddress()
    } else {
      accountOwnerAddress = ownerAddress
    }

    return new Account({
      ownerAddress: accountOwnerAddress,
      environment: this.environment,
      provider: accountTxProvider,
      signer: accountTxSigner
    })
  }

  computeAccountAddress (ownerAddress) {
    const deployerAddress = _.find(this.environment.deployments, { name: 'singletonFactory' }).address
    const implementationAddress = _.find(this.environment.deployments, { name: 'account' }).address
    const accountDeploymentSalt = this.environment.accountDeploymentSalt
    return computeAccountAddress(
      deployerAddress,
      implementationAddress,
      ownerAddress,
      accountDeploymentSalt
    )
  }

  recoverSigner ({ signature, typedDataHash }) {
    return recoverSigner({ signature, typedDataHash })
  }
}

module.exports = function (envConf) {
  return new BrinkSDK(envConf)
}
