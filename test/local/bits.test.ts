import { expect } from 'chai'
import {
  Strategy,
  TokenArgs,
  PrimitiveArgs
} from '@brink-sdk'

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

describe('Order.bits()', function () {
  it('should return bits for order, deduplicated', async function () {
    const strategy1 = new Strategy(strategyWithBits)
    const bits = strategy1.orders[1].bits()
    expect(bits.length).to.equal(1)
    expect(bits[0].index).to.equal(1n)
    expect(bits[0].value).to.equal(1n)
  })
})

describe('Strategy.bits()', function () {
  it('should return bits for the strategy, deduplicated', async function () {
    const strategy1 = new Strategy(strategyWithBits)
    const bits = strategy1.bits()
    expect(bits.length).to.equal(2)
    expect(bits[0].index).to.equal(0n)
    expect(bits[0].value).to.equal(1n)
    expect(bits[1].index).to.equal(1n)
    expect(bits[1].value).to.equal(1n)
  })

  it('should return empty array with strategy has no bits', async function () {
    const strategy1 = new Strategy(strategyWithoutBits)
    const bits = strategy1.bits()
    expect(bits.length).to.equal(0)
  })
})

const strategyWithBits = {
  orders: [
    {
      primitives: [
        { functionName: 'useBit', params: { index: BigInt(0), value: BigInt(1) } } as PrimitiveArgs,
        {
          functionName: 'marketSwapExactInput',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: { address: USDC_ADDRESS } as TokenArgs,
            tokenOut: { address: WETH_ADDRESS } as TokenArgs,
            tokenInAmount: BigInt(1450000000),
            feePercent: BigInt(10000),
            feeMin: BigInt(0)
          }
        } as PrimitiveArgs
      ]
    },
    {
      primitives: [
        { functionName: 'useBit', params: { index: BigInt(1), value: BigInt(1) } } as PrimitiveArgs,
        {
          functionName: 'marketSwapExactInput',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: { address: USDC_ADDRESS } as TokenArgs,
            tokenOut: { address: WETH_ADDRESS } as TokenArgs,
            tokenInAmount: BigInt(1000000000),
            feePercent: BigInt(10000),
            feeMin: BigInt(0)
          }
        } as PrimitiveArgs
      ]
    },
    {
      primitives: [
        { functionName: 'useBit', params: { index: BigInt(1), value: BigInt(1) } } as PrimitiveArgs,
        {
          functionName: 'marketSwapExactInput',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: { address: WETH_ADDRESS } as TokenArgs,
            tokenOut: { address: USDC_ADDRESS } as TokenArgs,
            tokenInAmount: BigInt(1200000000),
            feePercent: BigInt(10000),
            feeMin: BigInt(0)
          }
        } as PrimitiveArgs
      ]
    }
  ]
}

const strategyWithoutBits = {
  orders: [
    {
      primitives: [
        {
          functionName: 'marketSwapExactInput',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: { address: USDC_ADDRESS } as TokenArgs,
            tokenOut: { address: WETH_ADDRESS } as TokenArgs,
            tokenInAmount: BigInt(1450000000),
            feePercent: BigInt(10000),
            feeMin: BigInt(0)
          }
        } as PrimitiveArgs
      ]
    },
  ]
}
