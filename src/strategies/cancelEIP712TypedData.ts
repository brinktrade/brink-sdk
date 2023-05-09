import { EIP712TypedData } from '../Types'
import Config from '../Config'
import { MetaDelegateCallSignedParamTypes } from '../internal/constants'
import { accountFromSigner } from '../core'
import encodeFunctionCall from '../internal/encodeFunctionCall'

const  { getTypedData } = require('@brinkninja/utils/src/typedData')

export type CancelEIP712TypedDataArgs = {
  signer: string
  chainId: number
  bitmapIndex: BigInt
  bit: BigInt
}

async function cancelEIP712TypedData ({
  signer,
  chainId,
  bitmapIndex,
  bit
}: CancelEIP712TypedDataArgs): Promise<EIP712TypedData> {  
  const account = accountFromSigner({ signer })

  const cancelFnCallData = encodeFunctionCall({
    functionName: 'cancel',
    paramTypes: ['uint256', 'uint256'],
    params: [bitmapIndex, bit]
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
