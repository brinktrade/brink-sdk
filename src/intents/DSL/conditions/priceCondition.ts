import { SegmentArgs, PriceOperator, PriceConditionArgs, TokenWithDecimalsArgs } from '@brinkninja/types'
import Token from '../../Token'
import { priceToTwapValue, UniV3Twap } from '../../../oracles'
import { bigintToFeeAmount, toBigint, toTokenWithDecimalsArgs } from '../../../internal'

const DEFAULT_TIME_INTERVAL = BigInt(60)

// The `PriceConditionFunctionArgs` interface is specifically tailored for the `priceCondition` function,
// ensuring that the parameters it receives are of the correct type after the Joi validation has occurred.
// The need for this interface arises because, within the system's flow, `tokenA` and `tokenB` start as
// types that can either be a simple string or a more complex object (`TokenWithDecimalsArgs`). However,
// once the Joi validation step is completed, these parameters are no longer simple strings; they are
// always objects with additional attributes necessary for the `priceCondition` function to operate correctly.
interface PriceConditionFunctionArgs extends Omit<PriceConditionArgs, 'tokenA' | 'tokenB'> {
  tokenA: TokenWithDecimalsArgs;
  tokenB: TokenWithDecimalsArgs;
}

function priceCondition ({
  operator,
  tokenA,
  tokenB,
  price,
  twapInterval = DEFAULT_TIME_INTERVAL,
  twapFeePool,
}: PriceConditionFunctionArgs): SegmentArgs[] {
  const twapFeePoolBN = twapFeePool ? toBigint(twapFeePool) : undefined

  const fee = twapFeePoolBN ? bigintToFeeAmount(twapFeePoolBN) : undefined

  const twap = new UniV3Twap({
    tokenA: new Token(tokenA),
    tokenB: new Token(tokenB),
    interval: twapInterval,
    fee: fee,
  })

  const oracle = {
    address: twap.address,
    params: twap.params,
  }

  const twapValue = priceToTwapValue({
    price,
    tokenA_decimals: tokenA.decimals,
    tokenB_decimals: tokenB.decimals,
  })

  switch (operator) {
    case PriceOperator.LESS_THAN:
    return [{
      functionName: 'requireUint256LowerBound', 
      params: {
        oracle: oracle,
        lowerBound: twapValue,
      }
    }]
    case PriceOperator.GREATER_THAN:
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

export default priceCondition
