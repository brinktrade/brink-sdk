const _ = require('lodash')
const Account = require('./src/Account')
const AccountSigner = require('./src/AccountSigner')
const getChainId = require('./src/getChainId')

const account = (ownerAddress, { provider, signer, verifiers }) => {
  if (!provider) throw new Error(`no provider specified`)

  const accountTxSigner = signer || provider.getSigner()
  if (!accountTxSigner) throw new Error(`no signer specified`)

  return new Account({
    ownerAddress,
    provider,
    signer: accountTxSigner,
    verifiers
  })
}

const accountSigner = (accountOwnerSigner, opts = {}) => {
  if (!accountOwnerSigner) throw new Error(`no accountOwnerSigner specified`)
  if (!opts.network) { opts.network = 'mainnet' }
  return new AccountSigner({
    signer: accountOwnerSigner,
    chainId: getChainId(opts.network),
    verifiers: opts.verifiers
  })
}

module.exports = {
  account,
  accountSigner,
  proxyAccountFromOwner: require('./src/proxyAccountFromOwner'),
  recoverSigner: require('./src/recoverSigner'),
  verifySignedMessage: require('./src/verifySignedMessage'),
  parseSignedMessage: require('./src/parseSignedMessage'),
  encodeFunctionCall: require('./src/encodeFunctionCall'),
  verifyParamInput: require('./src/utils/verifyParamInput')
}
