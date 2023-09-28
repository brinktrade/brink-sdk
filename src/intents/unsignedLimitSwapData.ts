import { BigIntish } from '@brinkninja/types'
import evm from '../internal/EthereumJsVm'
import {
  IdsProof,
  CallStruct
} from '..'

export type UnsignedLimitSwapDataArgs = {
  recipient: string
  amount: BigIntish
  tokenInIdsProof?: IdsProof
  tokenOutIdsProof?: IdsProof
  callData: CallStruct
}

async function unsignedLimitSwapData ({
  recipient,
  amount,
  tokenInIdsProof = new IdsProof(),
  tokenOutIdsProof = new IdsProof(),
  callData
}: UnsignedLimitSwapDataArgs): Promise<string> {
  return await evm.unsignedLimitSwapData(
    recipient,
    amount,
    tokenInIdsProof,
    tokenOutIdsProof,
    callData
  )
}

export default unsignedLimitSwapData
