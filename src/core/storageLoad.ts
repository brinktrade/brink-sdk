import getSignerAccount from './getSignerAccount'
import { RpcMethodCall } from '@brinkninja/types'

export type StorageLoadArgs = {
  signer: string,
  pointer: string
}

function storageLoad ({
  signer,
  pointer
}: StorageLoadArgs): RpcMethodCall {
  return {
    method: 'eth_getStorageAt',
    params: [ getSignerAccount({ signer }), pointer, 'latest']
  }
}

export default storageLoad
