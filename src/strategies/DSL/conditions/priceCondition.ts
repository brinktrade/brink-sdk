import { PrimitiveArgs, GREATER_THAN_OPERATOR, LESS_THAN_OPERATOR } from '@brinkninja/types'
import { PriceConditionArgs, UniV3Twap, Token } from '@brink-sdk'
import { toTokenArgs } from '@brink-sdk/internal/toTokenArgs';

const TIME_INTERVAL = BigInt(1000)

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
    case LESS_THAN_OPERATOR:
    return [{
      functionName: 'requireUint256LowerBound', 
      params: {
        oracle: oracle,
        lowerBound: price,
      }
    }]
    case GREATER_THAN_OPERATOR:
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

export default priceCondition
