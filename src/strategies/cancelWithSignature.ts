import config from '../Config'
import { TransactionData, BigIntish } from '../Types'
import { metaDelegateCall } from '../core'
import encodeFunctionCall from '../internal/encodeFunctionCall'

const { CANCEL_VERIFIER } = config

export type CancelWithSignatureArgs = {
  signer: string
  bitmapIndex: BigIntish
  bit: BigIntish
  signature: string
  deployAccount?: boolean
}

async function cancelWithSignature ({
  signer,
  bitmapIndex,
  bit,
  signature,
  deployAccount = false
}: CancelWithSignatureArgs): Promise<TransactionData> {
  const cancelFnCallData = encodeFunctionCall({
    functionName: 'cancel',
    paramTypes: ['uint256', 'uint256'],
    params: [BigInt(bitmapIndex), BigInt(bit)]
  })

  return await metaDelegateCall({
    signer,
    to: CANCEL_VERIFIER,
    data: cancelFnCallData,
    signature,
    deployAccount
  })
}

export default cancelWithSignature
