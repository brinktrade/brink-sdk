import { expect } from 'chai'
import { priceCondition, priceToTwapValue, Token, UniV3Twap } from '@brink-sdk'

describe('priceCondition', function () {
  const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'

  const tokenArgs = {
      tokenA: USDC_ADDRESS,
      tokenA_decimals: 2,
      tokenB: DAI_ADDRESS,
      tokenB_decimals: 2,
  }

  it('should return requireUint256LowerBound primitive when operator is lt', function () {
    const primitives = priceCondition({
      ...tokenArgs,
      type: 'price',
      operator: 'lt',
      price: 1000
    })

    expect(primitives.length).to.equal(1)
    expect(primitives[0].functionName).to.equal('requireUint256LowerBound')
    expect(primitives[0].params.lowerBound).to.equal(getTwapValue(1000))

    const twap = new UniV3Twap({
      tokenA: new Token({address: USDC_ADDRESS}),
      tokenB: new Token({address: DAI_ADDRESS}),
      interval: BigInt(1000),
    })

    expect(primitives[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params })
  })

  it('should return requireUint256UpperBound primitive when operator is gt', function () {
    const primitives = priceCondition({
      ...tokenArgs,
      type: 'price',
      operator: 'gt',
      price: 2000
    })

    expect(primitives.length).to.equal(1)
    expect(primitives[0].functionName).to.equal('requireUint256UpperBound')
    expect(primitives[0].params.upperBound).to.equal(getTwapValue(2000))

    const twap = new UniV3Twap({
      tokenA: new Token({address: USDC_ADDRESS}),
      tokenB: new Token({address: DAI_ADDRESS}),
      interval: BigInt(1000),
    })

    expect(primitives[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params })
  })

  function getTwapValue(price: number): bigint {
    return priceToTwapValue({
      price: price,
      tokenA_decimals: tokenArgs.tokenA_decimals,
      tokenB_decimals: tokenArgs.tokenB_decimals,
    })
  }
})
