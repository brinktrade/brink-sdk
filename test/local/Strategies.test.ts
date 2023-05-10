import { expect } from 'chai'
import { FeeAmount } from '@uniswap/v3-sdk'
import {
  Strategy,
  Order,
  UseBit,
  MarketSwapExactInput,
  RequireUint256LowerBound,
  UniV3Twap,
  Token,
  Config,
  PrimitiveJSON,
  OracleJSON
} from '@brink-sdk'

const { TWAP_ADAPTER } = Config

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const USDC_TOKEN = new Token({ address: USDC_ADDRESS })
const WETH_TOKEN = new Token({ address: WETH_ADDRESS })

describe('Strategies', function () {
  it('should build basic strategy and convert to JSON', async function () {
    const strategy1 = new Strategy(validStrategy1)
    const strategyJSON = await strategy1.toJSON()
    expect(strategyJSON.orders.length).to.equal(1)
    expect(strategyJSON.orders[0].primitives.length).to.equal(4)
  })

  it('should build strategy using Oracle primitive param classes', async function () {
    const strategy1 = new Strategy()

    const usdc_weth_500_twap = new UniV3Twap({
      tokenA: USDC_TOKEN,
      tokenB: WETH_TOKEN,
      interval: BigInt(3600),
      fee: FeeAmount.LOW
    })

    strategy1.orders[0] = new Order()
    strategy1.orders[0].primitives[0] = new UseBit({
      bitmapIndex: BigInt(0),
      bit: BigInt(1)
    })
    strategy1.orders[0].primitives[1] = new RequireUint256LowerBound({
      oracle: usdc_weth_500_twap,
      lowerBound: BigInt(1000) * BigInt(2)**BigInt(96)
    })
    strategy1.orders[0].primitives[2] = new MarketSwapExactInput({
      oracle: usdc_weth_500_twap,
      signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
      tokenIn: USDC_TOKEN,
      tokenOut: WETH_TOKEN,
      tokenInAmount: BigInt(1000) * BigInt(10)**BigInt(6),
      feePercent: BigInt(1000),
      feeMin: BigInt(0)
    })

    const strategyJSON = await strategy1.toJSON()
    expect((strategyJSON.orders[0].primitives[2].params.oracle as OracleJSON).address).to.equal(TWAP_ADAPTER)
  })

  describe('validate()', function () {
    it('should return valid for valid strategy', async function () {
      const strategy = new Strategy(validStrategy1)
      expect(strategy.validate().valid).to.be.true
    })

    it('empty strategy should be invalid', async function () {
      const strategy = new Strategy()
      expect(strategy.validate().valid).to.be.false
      expect(strategy.validate().reason).to.equal('ZERO_ORDERS')
    })

    it('order with more than one swap should be invalid', function () {
      const strategy = new Strategy()
      strategy.orders[0] = new Order()
      strategy.orders[0].primitives[0] = new MarketSwapExactInput({
        oracle: {
          address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
          params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
        },
        signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
        tokenIn: USDC_TOKEN,
        tokenOut: WETH_TOKEN,
        tokenInAmount: BigInt(1000) * BigInt(10)**BigInt(6),
        feePercent: BigInt(1000),
        feeMin: BigInt(0)
      })
      strategy.orders[0].primitives[1] = new MarketSwapExactInput({
        oracle: {
          address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
          params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
        },
        signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
        tokenIn: USDC_TOKEN,
        tokenOut: WETH_TOKEN,
        tokenInAmount: BigInt(1000) * BigInt(10)**BigInt(6),
        feePercent: BigInt(1000),
        feeMin: BigInt(0)
      })
      expect(strategy.validate().valid).to.be.false
      expect(strategy.validate().reason).to.equal('WRONG_NUMBER_OF_SWAPS')
    })

    it('order with zero swaps should be invalid', function () {
      const strategy = new Strategy()
      strategy.orders[0] = new Order()
      strategy.orders[0].primitives[0] = new UseBit({ bitmapIndex: BigInt(0), bit: BigInt(1) })
      expect(strategy.validate().valid).to.be.false
      expect(strategy.validate().reason).to.equal('WRONG_NUMBER_OF_SWAPS')
    })
  })
})

const validStrategy1 = {
  orders: [
    {
      primitives: [
        {
          functionName: 'useBit',
          params: {
            bitmapIndex: BigInt(0),
            bit: BigInt(1)
          }
        } as PrimitiveJSON,
        {
          functionName: 'requireBlockNotMined',
          params: {
            blockNumber: BigInt(169832100000000)
          }
        } as PrimitiveJSON,
        {
          functionName: 'requireUint256LowerBound',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            lowerBound: BigInt(1000) * BigInt(2)**BigInt(96)
          }
        } as PrimitiveJSON,
        {
          functionName: 'marketSwapExactInput',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: new Token({ address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }),
            tokenOut: new Token({ address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }),
            tokenInAmount: BigInt(1450000000),
            feePercent: BigInt(10000),
            feeMin: BigInt(0)
          }
        } as PrimitiveJSON
      ]
    }
  ]
}
