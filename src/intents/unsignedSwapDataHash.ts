import { CallStruct } from '@brinkninja/types'
import { IdsProof } from '.'
import { EthereumJsVm as evm } from '../internal'

export type unsignedSwapDataHashArgs = {
  recipient: string,
  tokenInIdsProof: IdsProof,
  tokenOutIdsProof: IdsProof,
  fillCall: CallStruct
}

export default async function unsignedSwapDataHash ({
  recipient,
  tokenInIdsProof,
  tokenOutIdsProof,
  fillCall
}: unsignedSwapDataHashArgs): Promise<string> {
  return await evm.unsignedSwapDataHash(recipient, tokenInIdsProof, tokenOutIdsProof, fillCall)
}
