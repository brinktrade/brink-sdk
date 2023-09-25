import { PrimitiveArgs, GREATER_THAN_OPERATOR, LESS_THAN_OPERATOR, BigIntish } from '@brinkninja/types'
import { PriceConditionArgs, UniV3Twap, Token, priceToTwapValue } from '@brink-sdk'
import { toTokenArgs } from '@brink-sdk/internal/toTokenArgs';
import { FeeAmount } from '@uniswap/v3-sdk'


const DEFAULT_TIME_INTERVAL = BigInt(1000)

function priceCondition ({
  operator,
  tokenA,
  tokenA_decimals,
  tokenB,
  tokenB_decimals,
  price,
  twapInterval = DEFAULT_TIME_INTERVAL,
  twapFeePool,
}: PriceConditionArgs): PrimitiveArgs[] {
  const twap = new UniV3Twap({
    tokenA: new Token(toTokenArgs(tokenA)),
    tokenB: new Token(toTokenArgs(tokenB)),
    interval: twapInterval,
    fee: BigIntishToFeeAmount(twapFeePool),
  })

  const oracle = {
    address: twap.address,
    params: twap.params,
  }

  const twapValue = priceToTwapValue({
    price,
    tokenA_decimals,
    tokenB_decimals,
  })

  switch (operator) {
    case LESS_THAN_OPERATOR:
    return [{
      functionName: 'requireUint256LowerBound', 
      params: {
        oracle: oracle,
        lowerBound: twapValue,
      }
    }]
    case GREATER_THAN_OPERATOR:
      return [{
        functionName: 'requireUint256UpperBound',
        params: {
          oracle: oracle,
          upperBound: twapValue,
        }
      }]
    default:
      throw new Error(`Operator ${operator} is not valid`)
  }
}

function BigIntishToFeeAmount(value: BigIntish | undefined): FeeAmount | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (Object.values(FeeAmount).includes(Number(value))) {
        return value as FeeAmount;
    }

    throw new Error('Invalid fee amount');
}

export default priceCondition
