import _ from 'lodash'
import Account from './Account'
import AccountSigner from './AccountSigner'
import Strategies from './Strategies'
import getChainId from './getChainId'
import ParseSignedMessage from './parseSignedMessage'

const setupBrink = (opts: any = {}) => {

  const account = (ownerAddress: string, accountOpts: any = {}) => {
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

  const accountSigner = (accountOwnerSigner: any, signerOpts: any = {}) => {
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

  const strategies = (
    strategyTargetAddress: string,
    primitivesAddress: string
  ) => {
    return new Strategies(
      strategyTargetAddress,
      primitivesAddress
    )
  }

  return {
    Account: account,
    AccountSigner: accountSigner,
    Strategies: strategies,
    proxyAccountFromOwner: require('./proxyAccountFromOwner'),
    recoverSigner: require('./recoverSigner'),
    verifySignedMessage: require('./verifySignedMessage'),
    parseSignedMessage: ParseSignedMessage({ verifiers: opts.verifiers }),
    encodeFunctionCall: require('./encodeFunctionCall'),
    verifyParamInput: require('./utils/verifyParamInput')
  }
}

module.exports = setupBrink
