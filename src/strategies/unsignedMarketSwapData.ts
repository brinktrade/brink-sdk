import evm from './StrategiesEVM'
import {
  IdsProof,
  CallStruct
} from '.'

async function unsignedMarketSwapData (
  recipient: string,
  tokenInIdsProof: IdsProof,
  tokenOutIdsProof: IdsProof,
  callData: CallStruct
): Promise<string> {
  return await evm.unsignedMarketSwapData(
    recipient,
    tokenInIdsProof,
    tokenOutIdsProof,
    callData
  )
}

export default unsignedMarketSwapData
