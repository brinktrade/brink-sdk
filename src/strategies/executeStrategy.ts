import { TransactionData } from './StrategyTypes'
import SignedStrategy from './SignedStrategy'
import evm from '../internal/EthereumJsVm'
import { metaDelegateCall } from '../account'

// TODO: transform bad v ledger sigs here with sigToValidECDSA()
// we were previously doing this in AccountSigner, now that we don't have opinionated signing fn
// it needs to be done here before execution

export type ExecuteStrategyArgs = {
  signedStrategy: SignedStrategy
  orderIndex: number
  unsignedCalls: string[]
  deployAccount?: boolean
}

async function executeStrategy ({
  signedStrategy,
  orderIndex,
  unsignedCalls,
  deployAccount = false
}: ExecuteStrategyArgs): Promise<TransactionData> {
  const validationResult = await signedStrategy.validate()
  if (!validationResult.valid) {
    throw new Error(`Invalid strategy: ${validationResult.message}`)
  }

  const strategyJSON = (await signedStrategy.toJSON()).strategy
  const unsignedData = await evm.unsignedData(orderIndex, unsignedCalls)
  return await metaDelegateCall({
    signer: signedStrategy.signer,
    to: signedStrategy.strategyContract,
    data: strategyJSON.data as string,
    signature: signedStrategy.signature,
    unsignedData,
    deployAccount
  })
}

export default executeStrategy
