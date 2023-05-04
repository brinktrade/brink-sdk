// import _ from 'lodash'
// import Account from './Account'
// import AccountSigner from './AccountSigner'
// import getChainId from './getChainId'
// import ParseSignedMessage from './parseSignedMessage'
// import Config from './Config'

export * from './account'
export * from './oracles'
export * from './strategies'
export * from './SwapIO'
export * from './Config'
export * from './Types'
export * from './utils'
export * from './strategyEIP712TypedData'
export { default as Config } from './Config'
export { default as accountFromOwner } from './accountFromOwner'
export { default as strategyEIP712TypedData } from './strategyEIP712TypedData'

/*
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

    return new AccountSigner(
      accountOwnerSigner,
      getChainId(network),
      vers
    )
  }

  return {
    Account: account,
    AccountSigner: accountSigner,
    recoverSigner: require('./recoverSigner'),
    verifySignedMessage: require('./verifySignedMessage'),
    parseSignedMessage: ParseSignedMessage({ verifiers: opts.verifiers }),
    encodeFunctionCall: require('./encodeFunctionCall'),
    verifyParamInput: require('./utils/verifyParamInput'),
    config: Config
  }
}

export default setupBrink
*/
