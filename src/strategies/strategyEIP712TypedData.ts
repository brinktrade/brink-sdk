import { IntentGroup } from '.'
import { IntentGroupArgs, EIP712TypedData } from '@brinkninja/types'
import Config from '../Config'
import { MetaDelegateCallSignedParamTypes } from '../internal/constants'
import getSignerAccount from '../core/getSignerAccount'

const  { getTypedData } = require('@brinkninja/utils/src/typedData')

export type IntentGroupEIP712TypedDataArgs = {
  signer: string,
  chainId: number
  intentGroup: IntentGroupArgs
  intentGroupContract?: string
}

async function intentGroupEIP712TypedData ({
  signer,
  chainId,
  intentGroup: intentGroupArgs,
  intentGroupContract = Config['STRATEGY_TARGET_01'] as string
}: IntentGroupEIP712TypedDataArgs): Promise<EIP712TypedData> {  
  const account = getSignerAccount({ signer })

  const intentGroup = new IntentGroup(intentGroupArgs)
  const intentGroupValidation = intentGroup.validate()
  if (!intentGroupValidation.valid) {
    throw new Error(`Invalid intentGroup: ${intentGroupValidation.reason}: ${intentGroupValidation.message}`)
  }
  const intentGroupData = (await intentGroup.toJSON()).data

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
    [ intentGroupContract, intentGroupData ]
  )

  return {
    types: typedData.types,
    domain: typedData.domain,
    value: typedData.value,
    hash: typedDataHash
  }
}

export default intentGroupEIP712TypedData
