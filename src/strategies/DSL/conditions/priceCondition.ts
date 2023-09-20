import { PrimitiveArgs } from '@brinkninja/types'
import { PriceConditionArgs, UniV3Twap, Token } from '@brink-sdk'

const TIME_INTERVAL = BigInt(1000)

function priceCondition ({
  operator,
  tokenAddressA,
  tokenAddressB,
  price
}: PriceConditionArgs): PrimitiveArgs[] {
  const twap = new UniV3Twap({
    tokenA: new Token({address: tokenAddressA}),
    tokenB: new Token({address: tokenAddressB}),
    interval: TIME_INTERVAL,
  })

  const oracle = {
    address: twap.address,
    params: twap.params,
  }

  switch (operator) {
    case '<':
    return [{
      functionName: 'requireUint256LowerBound', 
      params: {
        oracle: oracle,
        lowerBound: price,
      }
    }]
    case '>':
      [{
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
