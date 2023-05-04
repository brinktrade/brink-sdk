import { ethers } from 'ethers'
import AccountAbi from '../contracts/Account.abi'
import { TransactionData } from '../strategies/StrategyTypes'

async function delegateCall (account: string, to: string, data: string): Promise<TransactionData> {
  const accountContract = new ethers.Contract(account, AccountAbi)
  const txData = await accountContract.populateTransaction.delegateCall(to, data)
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: BigInt(0)
  }
}

export default delegateCall
