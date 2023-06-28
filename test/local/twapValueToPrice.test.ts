import { expect } from 'chai'
import { twapValueToPrice } from '@brink-sdk'

describe('twapValueToPrice', function () {
  it('should return correct bigint price X96 value for token pair when price is decimal number < 0', async function () {
    // USDC (6 decimal) to WETH (18 decimal)
    const price = await twapValueToPrice({
      twapValue: 47536897508558602556126370201600000000n,
      tokenA_decimals: 6,
      tokenB_decimals: 18
    })
    expect(price).to.equal(0.0006)
  })

  it('should return correct bigint price X96 value for token pair when price is number > 0', async function () {
    // WETH (18 decimal) to USDC (6 decimal)
    const price = await twapValueToPrice({
      twapValue: 130894431853066387456n,
      tokenA_decimals: 18,
      tokenB_decimals: 6
    })
    expect(price).to.equal(1652.12)
  })
})
