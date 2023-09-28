import { expect } from 'chai'
import { priceCondition, priceToTwapValue, Token, UniV3Twap } from '@brink-sdk'

describe('priceCondition', function () {
  const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'

  const tokenArgs = {
      tokenA: {address: USDC_ADDRESS, decimals: 2},
      tokenB: {address: DAI_ADDRESS, decimals: 2},
      tokenB_decimals: 2,
  }

  it('should return requireUint256LowerBound segment when operator is lt', function () {
    const segments = priceCondition({
      ...tokenArgs,
      type: 'price',
      operator: 'lt',
      price: 1000
    })

    expect(segments.length).to.equal(1)
    expect(segments[0].functionName).to.equal('requireUint256LowerBound')
    expect(segments[0].params.lowerBound).to.equal(getTwapValue(1000))

    const twap = new UniV3Twap({
      tokenA: new Token({address: USDC_ADDRESS}),
      tokenB: new Token({address: DAI_ADDRESS}),
      interval: BigInt(1000),
    })

    expect(segments[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params })
  })

  it('should return requireUint256UpperBound segment when operator is gt', function () {
    const segments = priceCondition({
      ...tokenArgs,
      type: 'price',
      operator: 'gt',
      price: 2000
    })

    expect(segments.length).to.equal(1)
    expect(segments[0].functionName).to.equal('requireUint256UpperBound')
    expect(segments[0].params.upperBound).to.equal(getTwapValue(2000))

    const twap = new UniV3Twap({
      tokenA: new Token({address: USDC_ADDRESS}),
      tokenB: new Token({address: DAI_ADDRESS}),
      interval: BigInt(1000),
    })

    expect(segments[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params })
  })

  function getTwapValue(price: number): bigint {
    return priceToTwapValue({
      price: price,
      tokenA_decimals: tokenArgs.tokenA.decimals,
      tokenB_decimals: tokenArgs.tokenB.decimals,
    })
  }
})
