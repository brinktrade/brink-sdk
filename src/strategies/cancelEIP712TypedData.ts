import { EIP712TypedData, BitArgs } from '@brinkninja/types'
import Config from '../Config'
import { MetaDelegateCallSignedParamTypes } from '../internal/constants'
import { getSignerAccount } from '../core'
import encodeFunctionCall from '../utils/encodeFunctionCall'

const  { getTypedData } = require('@brinkninja/utils/src/typedData')

export type CancelEIP712TypedDataArgs = {
  signer: string
  chainId: number
  bit: BitArgs
}

async function cancelEIP712TypedData ({
  signer,
  chainId,
  bit
}: CancelEIP712TypedDataArgs): Promise<EIP712TypedData> {  
  const account = getSignerAccount({ signer })

  const cancelFnCallData = encodeFunctionCall({
    functionName: 'cancel',
    paramTypes: ['uint256', 'uint256'],
    params: [BigInt(bit.index), BigInt(bit.value)]
  })

  const domain = {
    name: 'BrinkAccount',
    version: '1',
    chainId,
    verifyingContract: account
  }
  const { typedData, typedDataHash } = getTypedData(
    domain,
    'metaDelegateCall',
    MetaDelegateCallSignedParamTypes,
    [ Config.CANCEL_VERIFIER, cancelFnCallData ]
  )

  return {
    types: typedData.types,
    domain: typedData.domain,
    value: typedData.value,
    hash: typedDataHash
  }
}

export default cancelEIP712TypedData
