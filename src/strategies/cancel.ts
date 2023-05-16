import config from '../Config'
import { TransactionData, BigIntish } from '@brinkninja/types'
import { delegateCall } from '../core'
import encodeFunctionCall from '../internal/encodeFunctionCall'

const { CANCEL_VERIFIER } = config

export type CancelArgs = {
  signer: string
  bitmapIndex: BigIntish
  bit: BigIntish
}

async function cancel ({
  signer,
  bitmapIndex,
  bit
}: CancelArgs): Promise<TransactionData> {
  const cancelFnCallData = encodeFunctionCall({
    functionName: 'cancel',
    paramTypes: ['uint256', 'uint256'],
    params: [
      BigInt(bitmapIndex),
      BigInt(bit)
    ]
  })

  return await delegateCall({
    signer,
    to: CANCEL_VERIFIER,
    data: cancelFnCallData
  })
}

export default cancel
