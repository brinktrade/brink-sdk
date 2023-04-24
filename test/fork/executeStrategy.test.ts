import { ethers } from 'hardhat'
import {
  executeStrategy,
  MarketSwapExactInput,
  Order,
  Strategy,
  Token,
  UniV3Twap,
  UseBit
} from '@brink-sdk'

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

describe('executeStrategy', function () {
  it('should execute a strategy', async function () {
    const usdc = new Token(USDC_ADDRESS)
    const weth = new Token(WETH_ADDRESS)
    const priceOracle = new UniV3Twap(usdc, weth, BigInt(1000))

    const strategy = new Strategy()
    strategy.orders[0] = new Order()
    strategy.orders[0].primitives[0] = new UseBit(BigInt(0), BigInt(2**0))
    strategy.orders[0].primitives[1] = new MarketSwapExactInput(
      priceOracle,
      await this.accountSigner.signerAddress(),
      new Token(USDC_ADDRESS),
      new Token(WETH_ADDRESS),
      BigInt(1450_000000),
      BigInt(10000),
      BigInt(0)
    )
    const signedStrategy = await this.accountSigner.signStrategyEIP712(await strategy.toJSON())

    console.log('SIGNED!: ', signedStrategy)

    console.log('PRICE: ', await priceOracle.price(ethers.provider))

    // this.fulfillTokenOutData = (await this.testFulfillSwap.populateTransaction.fulfillTokenOutSwap(
    //   WETH_ADDRESS, '10', this.ownerAddress
    // )).data

    // executeStrategy({
    //   strategy
    // })
  })
})
