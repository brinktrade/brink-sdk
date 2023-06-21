import config from '../Config'
import { TransactionData, BitArgs } from '@brinkninja/types'
import { delegateCall } from '../core'
import encodeFunctionCall from '../utils/encodeFunctionCall'

const { CANCEL_VERIFIER } = config

export type CancelArgs = {
  signer: string
  bit: BitArgs
}

async function cancel ({
  signer,
  bit
}: CancelArgs): Promise<TransactionData> {
  const cancelFnCallData = encodeFunctionCall({
    functionName: 'cancel',
    paramTypes: ['uint256', 'uint256'],
    params: [
      BigInt(bit.index),
      BigInt(bit.value)
    ]
  })

  return await delegateCall({
    signer,
    to: CANCEL_VERIFIER,
    data: cancelFnCallData
  })
}

export default cancel
