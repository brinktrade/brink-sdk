import { expect } from 'chai'
import getUniV3Pool from '../src/utils/getUniV3Pool'

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const USDC_WETH_500_POOL = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'

describe('getUniV3Pool', function () {
  it('should return the correct pool address', async function () {
    const poolAddress = getUniV3Pool(USDC_ADDRESS, WETH_ADDRESS, 500)
    expect(poolAddress).to.equal(USDC_WETH_500_POOL)
  })

  it('should return the correct pool address when pair is inverted', async function () {
    const poolAddress = getUniV3Pool(WETH_ADDRESS, USDC_ADDRESS, 500)
    expect(poolAddress).to.equal(USDC_WETH_500_POOL)
  })
})
