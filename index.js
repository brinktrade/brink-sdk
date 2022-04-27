const _ = require('lodash')
const Account = require('./src/Account')
const AccountSigner = require('./src/AccountSigner')
const getChainId = require('./src/getChainId')

const account = (ownerAddress, { provider, signer }) => {
  if (!provider) throw new Error(`no provider specified`)

  const accountTxSigner = signer || provider.getSigner()
  if (!accountTxSigner) throw new Error(`no signer specified`)

  return new Account({
    ownerAddress,
    provider,
    signer: accountTxSigner
  })
}

const accountSigner = (accountOwnerSigner, network) => {
  if (!accountOwnerSigner) throw new Error(`no accountOwnerSigner specified`)
  return new AccountSigner({
    signer: accountOwnerSigner,
    chainId: getChainId(network)
  })
}

module.exports = {
  account,
  accountSigner,
  proxyAccountFromOwner: require('./src/proxyAccountFromOwner'),
  recoverSigner: require('./src/recoverSigner'),
  verifySignedMessage: require('./src/verifySignedMessage'),
  parseSignedMessage: require('./src/parseSignedMessage')
}
