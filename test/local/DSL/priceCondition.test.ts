import { expect } from 'chai'
import { priceCondition, Token, UniV3Twap } from '@brink-sdk'

describe('priceCondition', function () {

  const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'

  it('should return requireUint256LowerBound primitive when operator is <', function () {
    const primitives = priceCondition({
      type: 'price',
      operator: '<',
      tokenAddressA: USDC_ADDRESS,
      tokenAddressB: DAI_ADDRESS,
      price: 1000
    })

    expect(primitives.length).to.equal(1)
    expect(primitives[0].functionName).to.equal('requireUint256LowerBound')
    expect(primitives[0].params.lowerBound).to.equal(1000)

    const twap = new UniV3Twap({
      tokenA: new Token({address: USDC_ADDRESS}),
      tokenB: new Token({address: DAI_ADDRESS}),
      interval: BigInt(1000),
    })

    expect(primitives[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params })
  })

  it('should return requireUint256UpperBound primitive when operator is >', function () {
    const primitives = priceCondition({
      type: 'price',
      operator: '>',
      tokenAddressA: USDC_ADDRESS,
      tokenAddressB: DAI_ADDRESS,
      price: 2000
    })

    expect(primitives.length).to.equal(1)
    expect(primitives[0].functionName).to.equal('requireUint256UpperBound')
    expect(primitives[0].params.upperBound).to.equal(2000)

    const twap = new UniV3Twap({
      tokenA: new Token({address: USDC_ADDRESS}),
      tokenB: new Token({address: DAI_ADDRESS}),
      interval: BigInt(1000),
    })

    expect(primitives[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params })
  })
})
