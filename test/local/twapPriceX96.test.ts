import { expect } from 'chai'
import { twapPriceX96 } from '@brink-sdk'

describe('twapPriceX96', function () {
  it('should return correct bigint price X96 value for token pair when price is decimal number < 0', async function () {
    // USDC (6 decimal) to WETH (18 decimal)
    const priceX96 = await twapPriceX96({
      price: 0.0006, // USDC/WETH price
      tokenA_decimals: 6,
      tokenB_decimals: 18
    })
    expect(priceX96).to.equal(47536897508558602556126370201600000000n)
  })

  it('should return correct bigint price X96 value for token pair when price is number > 0', async function () {
    // WETH (18 decimal) to USDC (6 decimal)
    const priceX96 = await twapPriceX96({
      price: 1652.12, // WETH/USDC price
      tokenA_decimals: 18,
      tokenB_decimals: 6
    })
    expect(priceX96).to.equal(130894431853066387456n)
  })
})
