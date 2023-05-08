import bitmapPointer from './bitmapPointer'
import storageLoad from './storageLoad'
import { RpcMethodCall } from '../strategies/StrategyTypes'

export type LoadBitmapArgs = {
  signer: string,
  bitmapIndex: BigInt
}

function loadBitmap ({
  signer,
  bitmapIndex
}: LoadBitmapArgs): RpcMethodCall {
  return storageLoad({ signer, pointer: bitmapPointer(bitmapIndex) })
}

export default loadBitmap
