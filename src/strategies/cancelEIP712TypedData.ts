import { EIP712TypedData, BigIntish } from '@brinkninja/types'
import Config from '../Config'
import { MetaDelegateCallSignedParamTypes } from '../internal/constants'
import { getSignerAccount } from '../core'
import encodeFunctionCall from '../utils/encodeFunctionCall'

const  { getTypedData } = require('@brinkninja/utils/src/typedData')

export type CancelEIP712TypedDataArgs = {
  signer: string
  chainId: number
  bitmapIndex: BigIntish
  bit: BigIntish
}

async function cancelEIP712TypedData ({
  signer,
  chainId,
  bitmapIndex,
  bit
}: CancelEIP712TypedDataArgs): Promise<EIP712TypedData> {  
  const account = getSignerAccount({ signer })

  const cancelFnCallData = encodeFunctionCall({
    functionName: 'cancel',
    paramTypes: ['uint256', 'uint256'],
    params: [BigInt(bitmapIndex), BigInt(bit)]
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
