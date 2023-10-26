import { SegmentArgs, PriceOperator, PriceConditionArgs } from '@brinkninja/types'
import Token from '../../Token'
import { priceToTwapValue, UniV3Twap } from '../../../oracles'
import { bigintToFeeAmount, toBigint, toTokenWithDecimalsArgs } from '../../../internal'

const DEFAULT_TIME_INTERVAL = BigInt(60)

function priceCondition ({
  operator,
  tokenA,
  tokenB,
  price,
  twapInterval = DEFAULT_TIME_INTERVAL,
  twapFeePool,
}: PriceConditionArgs): SegmentArgs[] {
  const chainId = 1 // TODO: get from context

  const twapFeePoolBN = twapFeePool ? toBigint(twapFeePool) : undefined

  const fee = twapFeePoolBN ? bigintToFeeAmount(twapFeePoolBN) : undefined

  const twap = new UniV3Twap({
    tokenA: new Token(toTokenWithDecimalsArgs(tokenA, chainId)),
    tokenB: new Token(toTokenWithDecimalsArgs(tokenB, chainId)),
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
