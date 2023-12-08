import { CallStruct } from '@brinkninja/types'
import { IdsProof } from '.'
import { EthereumJsVm as evm } from '../internal'

export type unsignedSwapDataHashArgs = {
  recipient: string,
  tokenInIdsProof: IdsProof,
  tokenOutIdsProof: IdsProof,
  callData: CallStruct
}

export default async function unsignedSwapDataHash ({
  recipient,
  tokenInIdsProof,
  tokenOutIdsProof,
  callData
}: unsignedSwapDataHashArgs): Promise<string> {
  return await evm.unsignedSwapDataHash(recipient, tokenInIdsProof, tokenOutIdsProof, callData)
}
