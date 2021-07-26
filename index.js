const _ = require('lodash')
const { loadEnvironment } = require('@brinkninja/environment')
const Account = require('./src/Account')
const AccountSigner = require('./src/AccountSigner')

class BrinkSDK {

  // environment: @brinkninja/environment network string or configuration object
  // ethers: ethers.js instance
  // signer: ethers.js signer (options, uses provider.signer by default)
  constructor ({ environment, ethers, signer }) {
    if (!environment) throw new Error(`no environment specified`)
    this.ethers = ethers
    this.signer = signer
    if (typeof environment == 'string') {
      this.environment = loadEnvironment(environment)
    } else {
      this.environment = environment
    }
  }

  account (ownerAddress, signer) {
    if (!this.ethers) throw new Error(`no ethers specified`)
    const accountTxSigner = signer || this.signer || this.ethers.provider.getSigner()
    if (!accountTxSigner) throw new Error(`no signer specified`)
    return new Account({
      ownerAddress,
      environment: this.environment,
      ethers: this.ethers,
      signer: accountTxSigner
    })
  }

  accountSigner (accountOwnerSigner) {
    if (!accountOwnerSigner) throw new Error(`no accountOwnerSigner specified`)
    return new AccountSigner({
      environment: this.environment,
      signer: accountOwnerSigner
    })
  }
}

module.exports = function (envConf) {
  return new BrinkSDK(envConf)
}
