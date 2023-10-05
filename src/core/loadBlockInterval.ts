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
  if(!id) throw new Error('Interval id is required')
  const pointer = blockIntervalPointer({ id });
  if(!pointer) throw new Error(`Invalid pointer for block interval: ${id}`)

  return storageLoad({ signer, pointer })
}

export default loadBlockInterval