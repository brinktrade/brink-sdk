import { PrimitiveArgs, TokenArgs } from '@brinkninja/types'
import { PriceConditionArgs, UniV3Twap, Token } from '@brink-sdk'

const TIME_INTERVAL = BigInt(1000)
const OPERATOR_LT = 'lt';
const OPERATOR_GT = 'gt';

function priceCondition ({
  operator,
  tokenA,
  tokenB,
  price
}: PriceConditionArgs): PrimitiveArgs[] {
  const twap = new UniV3Twap({
    tokenA: new Token(toTokenArgs(tokenA)),
    tokenB: new Token(toTokenArgs(tokenB)),
    interval: TIME_INTERVAL,
  })

  const oracle = {
    address: twap.address,
    params: twap.params,
  }

  switch (operator) {
    case OPERATOR_LT:
    return [{
      functionName: 'requireUint256LowerBound', 
      params: {
        oracle: oracle,
        lowerBound: price,
      }
    }]
    case OPERATOR_GT:
      return [{
        functionName: 'requireUint256UpperBound',
        params: {
          oracle: oracle,
          upperBound: price,
        }
      }]
    default:
      throw new Error(`Operator ${operator} is not valid`)
  }
}

function toTokenArgs(token: string | TokenArgs ) : TokenArgs {
  return typeof token === 'string' ? {address: token} : token
}

export default priceCondition
