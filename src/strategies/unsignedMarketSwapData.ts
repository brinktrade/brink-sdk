import evm from '../internal/EthereumJsVm'
import {
  IdsProof,
  CallStruct
} from '.'

export type UnsignedMarketSwapDataArgs = {
  recipient: string
  tokenInIdsProof?: IdsProof
  tokenOutIdsProof?: IdsProof
  callData: CallStruct
}

async function unsignedMarketSwapData ({
  recipient,
  tokenInIdsProof = new IdsProof(),
  tokenOutIdsProof = new IdsProof(),
  callData
}: UnsignedMarketSwapDataArgs): Promise<string> {
  return await evm.unsignedMarketSwapData(
    recipient,
    tokenInIdsProof,
    tokenOutIdsProof,
    callData
  )
}

export default unsignedMarketSwapData
