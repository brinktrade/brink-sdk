import { EIP712TypedData } from './StrategyTypes'
import Config from '../Config'
import { MetaDelegateCallSignedParamTypes } from '../constants'
import { accountFromSigner } from '../account'
import encodeFunctionCall from '../encodeFunctionCall'

const  { getTypedData } = require('@brinkninja/utils/src/typedData')

export type CancelEIP712TypedDataArgs = {
  account?: string
  signer?: string
  chainId: number
  bitmapIndex: BigInt
  bit: BigInt
}

async function cancelEIP712TypedData ({
  account,
  signer,
  chainId,
  bitmapIndex,
  bit
}: CancelEIP712TypedDataArgs): Promise<EIP712TypedData> {  
  if (!account && !signer) {
    throw new Error(`account or signer required`)
  } else if (account && signer) {
    throw new Error(`account and signer cannot both be provided`)
  }

  if (signer) {
    account = accountFromSigner(signer as string)
  }

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
