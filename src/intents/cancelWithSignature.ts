import config from '../Config'
import { TransactionData, BitArgs } from '@brinkninja/types'
import { metaDelegateCall } from '../core'
import encodeFunctionCall from '../utils/encodeFunctionCall'

const { CANCEL_VERIFIER } = config

export type CancelWithSignatureArgs = {
  signer: string
  bit: BitArgs
  signature: string
  deployAccount?: boolean
}

async function cancelWithSignature ({
  signer,
  bit,
  signature,
  deployAccount = false
}: CancelWithSignatureArgs): Promise<TransactionData> {
  const cancelFnCallData = encodeFunctionCall({
    functionName: 'cancel',
    paramTypes: ['uint256', 'uint256'],
    params: [BigInt(bit.index), BigInt(bit.value)]
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
