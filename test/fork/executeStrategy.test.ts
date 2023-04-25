import { ethers } from 'hardhat'
import {
  unsignedMarketSwapData,
  MarketSwapExactInput,
  Order,
  Strategy,
  Token,
  UniV3Twap,
  UseBit,
  IdsProof,
  marketSwapExactInput_getOutput
} from '@brink-sdk'

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

describe('executeStrategy', function () {
  it('should execute a strategy', async function () {
    const usdc = new Token(USDC_ADDRESS)
    const weth = new Token(WETH_ADDRESS)
    const priceOracle = new UniV3Twap(usdc, weth, BigInt(1000))

    const usdcInput = BigInt(1450_000000)
    const feePercent = BigInt(10000)
    const feeMin = BigInt(0)

    const strategy = new Strategy()
    strategy.orders[0] = new Order()
    strategy.orders[0].primitives[0] = new UseBit(BigInt(0), BigInt(2**0))
    strategy.orders[0].primitives[1] = new MarketSwapExactInput(
      priceOracle,
      await this.accountSigner.signerAddress(),
      new Token(USDC_ADDRESS),
      new Token(WETH_ADDRESS),
      usdcInput,
      feePercent,
      feeMin
    )
    const signedStrategy = await this.accountSigner.signStrategyEIP712(await strategy.toJSON())

    console.log('SIGNED!: ', signedStrategy)

    const priceX96 = await priceOracle.price(ethers.provider)
    console.log('PRICE: ', priceX96)

    const { output: wethOutput } = await marketSwapExactInput_getOutput(
      usdcInput,
      priceX96,
      feePercent,
      feeMin
    )
    console.log('WETH OUT: ', wethOutput.toString())

    this.fulfillTokenOutData = (await this.testFulfillSwap.populateTransaction.fulfillTokenOutSwap(
      WETH_ADDRESS, wethOutput.toString(), this.ownerAddress
    )).data

    console.log('fulfill data: ', this.fulfillTokenOutData)

    const unsignedSwapCall = await unsignedMarketSwapData(
      this.ownerAddress,
      new IdsProof(),
      new IdsProof(),
      {
        targetContract: this.testFulfillSwap.address,
        data: this.fulfillTokenOutData
      }
    )
    console.log('UNSIGNED SWAP CALL: ', unsignedSwapCall)

    const res = await this.account.executeStrategy({
      signedStrategy,
      orderIndex: 0,
      unsignedCalls: [unsignedSwapCall]
    })
    console.log(res)
  })
})
