import { Strategy } from '.'
import { StrategyJSON, EIP712TypedData } from './StrategyTypes'
import Config from '../Config'
import { MetaDelegateCallSignedParamTypes } from '../internal/constants'
import accountFromSigner from '../account/accountFromSigner'

const  { getTypedData } = require('@brinkninja/utils/src/typedData')

export type StrategyEIP712TypedDataArgs = {
  signer: string,
  chainId: number
  strategy: StrategyJSON
  strategyContract?: string
}

async function strategyEIP712TypedData ({
  signer,
  chainId,
  strategy: strategyJSON,
  strategyContract = Config['STRATEGY_TARGET_01'] as string
}: StrategyEIP712TypedDataArgs): Promise<EIP712TypedData> {  
  const account = accountFromSigner({ signer })

  const strategy = new Strategy(strategyJSON)
  const strategyValidation = strategy.validate()
  if (!strategyValidation.valid) {
    throw new Error(`Invalid strategy: ${strategyValidation.reason}: ${strategyValidation.message}`)
  }
  const strategyData = (await strategy.toJSON()).data

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
    [ strategyContract, strategyData ]
  )

  return {
    types: typedData.types,
    domain: typedData.domain,
    value: typedData.value,
    hash: typedDataHash
  }
}

export default strategyEIP712TypedData
