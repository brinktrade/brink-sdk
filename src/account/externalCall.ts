import { ethers } from 'ethers'
import AccountAbi from '../contracts/Account.abi'
import { TransactionData } from '../strategies/StrategyTypes'

async function externalCall (account: string, value: BigInt, to: string, data: string): Promise<TransactionData> {
  const accountContract = new ethers.Contract(account, AccountAbi)
  const txData = await accountContract.populateTransaction.externalCall(value, to, data)
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: BigInt(0)
  }
}

export default externalCall
