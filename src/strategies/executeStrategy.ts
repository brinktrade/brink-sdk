import { ethers } from 'ethers'
import { TransactionData } from './StrategyTypes'
import SignedStrategy from './SignedStrategy'
import evm from './StrategiesEVM'
import AccountABI from '../contracts/Account.abi'

// TODO: transform bad v ledger sigs here with sigToValidECDSA()
// we were previously doing this in AccountSigner, now that we don't have opinionated signing fn
// it needs to be done here before execution

export interface ExecuteStrategyArgs {
  signedStrategy: SignedStrategy,
  orderIndex: number,
  unsignedCalls: string[]
}

async function executeStrategy ({
  signedStrategy,
  orderIndex,
  unsignedCalls
}: ExecuteStrategyArgs): Promise<TransactionData> {
  const validationResult = await signedStrategy.validate()
  if (!validationResult.valid) {
    throw new Error(`Invalid strategy: ${validationResult.message}`)
  }

  const strategyJSON = (await signedStrategy.toJSON()).strategy
  const unsignedData = await evm.unsignedData(orderIndex, unsignedCalls)

  const accountContract = new ethers.Contract(signedStrategy.account(), AccountABI)
  const txData = await accountContract.populateTransaction.metaDelegateCall(
    signedStrategy.strategyContract,
    strategyJSON.data,
    signedStrategy.signature,
    unsignedData
  )
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: BigInt(0)
  }
}

export default executeStrategy
