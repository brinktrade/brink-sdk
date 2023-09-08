import { type } from 'os'
import blockIntervalPointer from './blockIntervalPointer'
import storageLoad from './storageLoad'
import { RpcMethodCall, BigIntish } from '@brinkninja/types'

export type loadBlockIntervalArgs = {
  signer: string,
  id: BigIntish
}

function loadBlockInterval ({
  signer,
  id
}: loadBlockIntervalArgs): RpcMethodCall {

  const pointer = blockIntervalPointer({ id });
  if(!pointer) throw new Error(`Invalid pointer for block interval ${id}`)

  return storageLoad({ signer, pointer })
}

export default loadBlockInterval