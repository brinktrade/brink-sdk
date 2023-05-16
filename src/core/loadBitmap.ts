import bitmapPointer from './bitmapPointer'
import storageLoad from './storageLoad'
import { RpcMethodCall, BigIntish } from '@brinkninja/types'

export type LoadBitmapArgs = {
  signer: string,
  bitmapIndex: BigIntish
}

function loadBitmap ({
  signer,
  bitmapIndex
}: LoadBitmapArgs): RpcMethodCall {
  return storageLoad({ signer, pointer: bitmapPointer({ bitmapIndex }) })
}

export default loadBitmap
