const _ = require('lodash')
const Account = require('./src/Account')
const AccountSigner = require('./src/AccountSigner')
const proxyAccountFromOwner = require('./src/proxyAccountFromOwner')
const recoverSigner = require('./src/recoverSigner')
const getChainId = require('./src/getChainId')

class BrinkSDK {
  account (ownerAddress, { provider, signer }) {
    if (!provider) throw new Error(`no provider specified`)

    const accountTxSigner = signer || provider.getSigner()
    if (!accountTxSigner) throw new Error(`no signer specified`)

    return new Account({
      ownerAddress,
      provider,
      signer: accountTxSigner
    })
  }

  accountSigner (accountOwnerSigner, network) {
    if (!accountOwnerSigner) throw new Error(`no accountOwnerSigner specified`)
    return new AccountSigner({
      signer: accountOwnerSigner,
      chainId: getChainId(network)
    })
  }

  computeAccountAddress (ownerAddress) {
    return proxyAccountFromOwner(ownerAddress)
  }

  recoverSigner ({ signature, typedDataHash }) {
    return recoverSigner({ signature, typedDataHash })
  }
}

module.exports = function () {
  return new BrinkSDK()
}
