import config from '../Config'
import { TransactionData } from './StrategyTypes'
import { delegateCall } from '../account'
import encodeFunctionCall from '../internal/encodeFunctionCall'

const { CANCEL_VERIFIER } = config

export type CancelArgs = {
  signer: string
  bitmapIndex: BigInt
  bit: BigInt
}

async function cancel ({
  signer,
  bitmapIndex,
  bit
}: CancelArgs): Promise<TransactionData> {
  const cancelFnCallData = encodeFunctionCall({
    functionName: 'cancel',
    paramTypes: ['uint256', 'uint256'],
    params: [bitmapIndex, bit]
  })

  return await delegateCall({
    signer,
    to: CANCEL_VERIFIER,
    data: cancelFnCallData
  })
}

export default cancel
