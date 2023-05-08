import config from '../Config'
import { TransactionData } from './StrategyTypes'
import { metaDelegateCall } from '../account'
import encodeFunctionCall from '../encodeFunctionCall'

const { CANCEL_VERIFIER } = config

export type CancelWithSignatureArgs = {
  signer: string
  bitmapIndex: BigInt
  bit: BigInt
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
    params: [bitmapIndex, bit]
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
