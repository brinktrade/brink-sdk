import { RpcMethodCall } from '@brinkninja/types'
import { accountFromSigner } from '.'

export type AccountCodeArgs = {
  signer: string
}

const accountCode = ({
  signer
}: AccountCodeArgs): RpcMethodCall => {
  return {
    method: 'eth_getCode',
    params: [accountFromSigner({ signer }), 'latest']
  }
}

export default accountCode
