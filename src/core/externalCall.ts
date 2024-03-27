import { ethers } from 'ethers'
import AccountAbi from '../internal/contracts/Account.abi'
import { TransactionData, BigIntish } from '@brinkninja/types'
import getSignerAccount from './getSignerAccount'

export type ExternalCallArgs = {
  signer: string
  to: string
  value?: BigIntish
  data?: string
}

async function externalCall ({
  signer,
  to,
  value = BigInt(0),
  data = '0x'
}: ExternalCallArgs): Promise<TransactionData> {
  const account = getSignerAccount({ signer })
  const accountContract = new ethers.Contract(account, AccountAbi)
  const txData = await accountContract.externalCall.populateTransaction(BigInt(value), to, data)
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: '0'
  }
}

export default externalCall
