const _ = require('lodash')
const Account = require('./src/Account')
const AccountSigner = require('./src/AccountSigner')
const getChainId = require('./src/getChainId')
const ParseSignedMessage = require('./src/parseSignedMessage')

const setupBrink = (opts = {}) => {
  const account = (ownerAddress, accountOpts = {}) => {
    const { provider, signer, verifiers } = accountOpts
    const prov = provider || opts.provider
    if (!prov) throw new Error(`no provider specified`)

    const accountTxSigner = signer || opts.signer || prov.getSigner()
    if (!accountTxSigner) throw new Error(`no signer specified`)

    const vers = verifiers || opts.verifiers

    return new Account({
      ownerAddress,
      provider: prov,
      signer: accountTxSigner,
      verifiers: vers
    })
  }

  const accountSigner = (accountOwnerSigner, signerOpts = {}) => {
    if (!accountOwnerSigner) throw new Error(`no accountOwnerSigner specified`)

    let network = signerOpts.network || opts.network
    if (!network) { network = 'mainnet' }

    const vers = signerOpts.verifiers || opts.verifiers

    return new AccountSigner({
      signer: accountOwnerSigner,
      chainId: getChainId(network),
      verifiers: vers
    })
  }

  return {
    Account: account,
    AccountSigner: accountSigner,
    proxyAccountFromOwner: require('./src/proxyAccountFromOwner'),
    recoverSigner: require('./src/recoverSigner'),
    verifySignedMessage: require('./src/verifySignedMessage'),
    parseSignedMessage: ParseSignedMessage({ verifiers: opts.verifiers }),
    encodeFunctionCall: require('./src/encodeFunctionCall'),
    verifyParamInput: require('./src/utils/verifyParamInput')
  }
}

module.exports = setupBrink
