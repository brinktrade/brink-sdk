import accountFromSigner from './accountFromSigner'
import { RpcMethodCall } from '../Types'

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
    params: [ accountFromSigner({ signer }), pointer, 'latest']
  }
}

export default storageLoad
