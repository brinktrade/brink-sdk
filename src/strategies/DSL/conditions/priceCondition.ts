import { PrimitiveArgs, GREATER_THAN_OPERATOR, LESS_THAN_OPERATOR } from '@brinkninja/types'
import { PriceConditionArgs, UniV3Twap, Token } from '@brink-sdk'
import { toTokenArgs } from '@brink-sdk/internal/toTokenArgs';
import { FeeAmount } from '@uniswap/v3-sdk'


const DEFAULT_TIME_INTERVAL = BigInt(1000)

function priceCondition ({
  operator,
  tokenA,
  tokenB,
  price,
  twapInterval,
  twapFeePool
}: PriceConditionArgs): PrimitiveArgs[] {
  const twap = new UniV3Twap({
    tokenA: new Token(toTokenArgs(tokenA)),
    tokenB: new Token(toTokenArgs(tokenB)),
    interval: twapInterval || DEFAULT_TIME_INTERVAL,
    fee: twapFeePool as FeeAmount
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
