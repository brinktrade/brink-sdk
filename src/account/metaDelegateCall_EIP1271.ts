import { ethers } from 'ethers'
import AccountAbi from '../internal/contracts/Account.abi'
import { TransactionData } from '../strategies/StrategyTypes'

async function metaDelegateCall_EIP1271 (
  account: string,
  to: string,
  data: string,
  signature: string,
  unsignedData: string
): Promise<TransactionData> {
  const accountContract = new ethers.Contract(account, AccountAbi)
  const txData = await accountContract.populateTransaction.metaDelegateCall_EIP1271(to, data, signature, unsignedData)
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: BigInt(0)
  }
}

export default metaDelegateCall_EIP1271
