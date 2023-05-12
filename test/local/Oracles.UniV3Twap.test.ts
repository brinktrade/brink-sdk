import { expect } from 'chai'
import { Token, Config, UniV3Twap } from '@brink-sdk'

const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const dai = new Token({ address: DAI_ADDRESS })
const usdc = new Token({ address: USDC_ADDRESS })
const weth = new Token({ address: WETH_ADDRESS })

describe('UniV3Twap', function () {
  it('should return standard TWAP adapter data from token pair input where A < B', async function () {
    const uniV3Twap = new UniV3Twap({
      tokenA: usdc,
      tokenB: weth,
      interval: BigInt(1000)
    })
    expect(uniV3Twap.address).to.equal(Config['TWAP_ADAPTER'])
  })

  it('should return inverse TWAP adapter data from token pair input where B < A', async function () {
    const uniV3Twap = new UniV3Twap({
      tokenA: usdc,
      tokenB: dai,
      interval: BigInt(1000)
    })
    expect(uniV3Twap.address).to.equal(Config['TWAP_INVERSE_ADAPTER'])
  })
})
