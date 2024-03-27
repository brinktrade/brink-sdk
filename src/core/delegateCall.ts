import { ethers } from 'ethers'
import { getSignerAccount } from '.'
import AccountAbi from '../internal/contracts/Account.abi'
import { TransactionData } from '@brinkninja/types'

export type DelegateCallArgs = {
  signer: string,
  to: string,
  data: string
}

async function delegateCall ({
  signer,
  to,
  data
}: DelegateCallArgs): Promise<TransactionData> {
  const account = getSignerAccount({ signer })
  const accountContract = new ethers.Contract(account, AccountAbi)
  const txData = await accountContract.delegateCall.populateTransaction(to, data)
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: '0'
  }
}

export default delegateCall
