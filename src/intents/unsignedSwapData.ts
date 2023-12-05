import evm from '../internal/EthereumJsVm'
import {
  IdsProof,
  CallStruct
} from '..'

export type UnsignedSwapDataArgs = {
  recipient: string
  tokenInIdsProof?: IdsProof
  tokenOutIdsProof?: IdsProof
  callData: CallStruct,
  signature: string
}

async function unsignedSwapData ({
  recipient,
  tokenInIdsProof = new IdsProof(),
  tokenOutIdsProof = new IdsProof(),
  callData,
  signature
}: UnsignedSwapDataArgs): Promise<string> {
  return await evm.unsignedSwapData(
    recipient,
    tokenInIdsProof,
    tokenOutIdsProof,
    callData,
    signature
  )
}

export default unsignedSwapData
