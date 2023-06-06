import { RpcMethodCall } from '@brinkninja/types'
import { getSignerAccount } from '.'

export type AccountCodeArgs = {
  signer: string
}

const accountCode = ({
  signer
}: AccountCodeArgs): RpcMethodCall => {
  return {
    method: 'eth_getCode',
    params: [getSignerAccount({ signer }), 'latest']
  }
}

export default accountCode
