import { Declaration } from '.'
import { DeclarationArgs, EIP712TypedData } from '@brinkninja/types'
import Config from '../Config'
import { MetaDelegateCallSignedParamTypes } from '../internal/constants'
import getSignerAccount from '../core/getSignerAccount'

const  { getTypedData } = require('@brinkninja/utils/src/typedData')

export type DeclarationEIP712TypedDataArgs = {
  signer: string,
  chainId: number
  declaration: DeclarationArgs
  declarationContract?: string
}

async function declarationEIP712TypedData ({
  signer,
  chainId,
  declaration: declarationArgs,
  declarationContract = Config['STRATEGY_TARGET_01'] as string
}: DeclarationEIP712TypedDataArgs): Promise<EIP712TypedData> {  
  const account = getSignerAccount({ signer })

  const declaration = new Declaration(declarationArgs)
  const declarationValidation = declaration.validate()
  if (!declarationValidation.valid) {
    throw new Error(`Invalid declaration: ${declarationValidation.reason}: ${declarationValidation.message}`)
  }
  const declarationData = (await declaration.toJSON()).data

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
    [ declarationContract, declarationData ]
  )

  return {
    types: typedData.types,
    domain: typedData.domain,
    value: typedData.value,
    hash: typedDataHash
  }
}

export default declarationEIP712TypedData
