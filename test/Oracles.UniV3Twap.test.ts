import { expect } from 'chai'
import { Token } from '../src/strategies'
import Config from '../src/Config'
import { UniV3Twap } from '../src/oracles'

const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const dai = new Token(DAI_ADDRESS)
const usdc = new Token(USDC_ADDRESS)
const weth = new Token(WETH_ADDRESS)

describe('UniV3Twap', function () {
  it('should return standard TWAP adapter data from token pair input where A < B', async function () {
    const uniV3Twap = new UniV3Twap(usdc, weth, BigInt(1000))
    expect(uniV3Twap.contractAddress).to.equal(Config['UNIV3_TWAP_ADAPTER'])
  })

  it('should return inverse TWAP adapter data from token pair input where B < A', async function () {
    const uniV3Twap = new UniV3Twap(usdc, dai, BigInt(1000))
    expect(uniV3Twap.contractAddress).to.equal(Config['UNIV3_TWAP_INVERSE_ADAPTER'])
  })
})
