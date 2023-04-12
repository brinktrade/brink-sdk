import { expect } from 'chai'
import { FeeAmount } from '@uniswap/v3-sdk'
import { Strategy, Order, UseBit } from '../src/strategies'
import UniV3Twap from '../src/strategies/Oracles/UniV3Twap'
import MarketSwapExactInput from '../src/strategies/Primitives/MarketSwapExactInput'
import RequireUint256LowerBound from '../src/strategies/Primitives/RequireUint256LowerBound'
import { PrimitiveFunctionName } from '../src/strategies/StrategyTypes'
import Config from '../src/Config'
import Token from '../src/strategies/Token'

const { UNIV3_TWAP_ADAPTER } = Config

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const USDC_TOKEN = new Token(USDC_ADDRESS)
const WETH_TOKEN = new Token(WETH_ADDRESS)

describe('Strategies', function () {
  it('should build basic strategy and convert to JSON', async function () {
    const strategy1 = new Strategy(validStrategy1)
    const strategyJSON = await strategy1.toJSON()
    expect(strategyJSON.orders.length).to.equal(1)
    expect(strategyJSON.orders[0].primitives.length).to.equal(4)
  })

  it('should build strategy using Oracle primitive param classes', async function () {
    const strategy1 = new Strategy()

    const usdc_weth_500_twap = new UniV3Twap(USDC_TOKEN, WETH_TOKEN, BigInt(3600), FeeAmount.LOW)

    strategy1.orders[0] = new Order()
    strategy1.orders[0].primitives[0] = new UseBit(BigInt(0), BigInt(1))
    strategy1.orders[0].primitives[1] = new RequireUint256LowerBound(usdc_weth_500_twap, BigInt(1000) * BigInt(2)**BigInt(96))
    strategy1.orders[0].primitives[2] = new MarketSwapExactInput(
      usdc_weth_500_twap,
      '0x6399ae010188F36e469FB6E62C859dDFc558328A',
      USDC_TOKEN,
      WETH_TOKEN,
      BigInt(1000) * BigInt(10)**BigInt(6),
      BigInt(1000),
      BigInt(0)
    )

    const strategyJSON = await strategy1.toJSON()
    expect(strategyJSON.orders[0].primitives[2].params[0]).to.equal(UNIV3_TWAP_ADAPTER)
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
      strategy.orders[0].primitives[0] = marketSwapExactInput1
      strategy.orders[0].primitives[1] = marketSwapExactInput1
      expect(strategy.validate().valid).to.be.false
      expect(strategy.validate().reason).to.equal('WRONG_NUMBER_OF_SWAPS')
    })

    it('order with zero swaps should be invalid', function () {
      const strategy = new Strategy()
      strategy.orders[0] = new Order()
      strategy.orders[0].primitives[0] = new UseBit(BigInt(0), BigInt(1))
      expect(strategy.validate().valid).to.be.false
      expect(strategy.validate().reason).to.equal('WRONG_NUMBER_OF_SWAPS')
    })
  })
})

const marketSwapExactInput1_Params = [
  '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
  '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8',
  '0x6399ae010188F36e469FB6E62C859dDFc558328A',
  new Token('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
  new Token('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
  BigInt(1450000000),
  BigInt(10000),
  BigInt(0)
]

const marketSwapExactInput1 = new MarketSwapExactInput(
  marketSwapExactInput1_Params[0] as string,
  marketSwapExactInput1_Params[1] as string,
  marketSwapExactInput1_Params[2] as string,
  marketSwapExactInput1_Params[3] as Token,
  marketSwapExactInput1_Params[4] as Token,
  marketSwapExactInput1_Params[5] as BigInt,
  marketSwapExactInput1_Params[6] as BigInt,
  marketSwapExactInput1_Params[7] as BigInt
)

const validStrategy1 = {
  orders: [
    {
      primitives: [
        {
          functionName: 'useBit' as PrimitiveFunctionName,
          params: [0, 1]
        },
        {
          functionName: 'requireBlockNotMined' as PrimitiveFunctionName,
          params: [169832100000000]
        },
        {
          functionName: 'requireUint256LowerBound' as PrimitiveFunctionName,
          params: [
            '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648' as string,
            '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8' as string,
            (BigInt(1000) * BigInt(2)**BigInt(96)).toString()
          ]
        },
        {
          functionName: 'marketSwapExactInput' as PrimitiveFunctionName,
          params: marketSwapExactInput1_Params
        }
      ]
    }
  ]
}
