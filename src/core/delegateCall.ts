import { ethers } from 'ethers'
import { accountFromSigner } from '.'
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
  const account = accountFromSigner({ signer })
  const accountContract = new ethers.Contract(account, AccountAbi)
  const txData = await accountContract.populateTransaction.delegateCall(to, data)
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: '0'
  }
}

export default delegateCall
