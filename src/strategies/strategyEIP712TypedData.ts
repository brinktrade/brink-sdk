import { Strategy } from '.'
import { StrategyJSON, EIP712TypedData } from './StrategyTypes'
import Config from '../Config'
import { MetaDelegateCallSignedParamTypes } from '../constants'
import accountFromSigner from '../account/accountFromSigner'

const  { getTypedData } = require('@brinkninja/utils/src/typedData')

export type StrategyEIP712TypedDataArgs = {
  account?: string,
  signer?: string,
  chainId: number
  strategy: StrategyJSON
  strategyContract?: string
}

async function strategyEIP712TypedData ({
  account,
  signer,
  chainId,
  strategy: strategyJSON,
  strategyContract = Config['STRATEGY_TARGET_01'] as string
}: StrategyEIP712TypedDataArgs): Promise<EIP712TypedData> {  
  if (!account && !signer) {
    throw new Error(`account or signer required`)
  }

  const strategy = new Strategy(strategyJSON)
  const strategyValidation = strategy.validate()
  if (!strategyValidation.valid) {
    throw new Error(`Invalid strategy: ${strategyValidation.reason}: ${strategyValidation.message}`)
  }
  const strategyData = (await strategy.toJSON()).data

  if (!account) {
    account = accountFromSigner(signer as string)
  }

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
