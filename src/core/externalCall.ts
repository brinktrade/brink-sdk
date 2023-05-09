import { ethers } from 'ethers'
import AccountAbi from '../internal/contracts/Account.abi'
import { TransactionData } from '../Types'
import accountFromSigner from './accountFromSigner'

export type ExternalCallArgs = {
  signer: string
  to: string
  value?: BigInt
  data?: string
}

async function externalCall ({
  signer,
  to,
  value = BigInt(0),
  data = '0x'
}: ExternalCallArgs): Promise<TransactionData> {
  const account = accountFromSigner({ signer })
  const accountContract = new ethers.Contract(account, AccountAbi)
  const txData = await accountContract.populateTransaction.externalCall(value, to, data)
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: BigInt(0)
  }
}

export default externalCall
