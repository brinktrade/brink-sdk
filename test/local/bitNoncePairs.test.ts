import { expect } from 'chai'
import {
  Declaration,
  TokenArgs,
  SegmentArgs
} from '@brink-sdk'

const { SEGMENTS_01 } = require('@brinkninja/config').mainnet

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

describe('Intent.bitNoncePairs()', function () {
  it('should return bits and nonce pair for declaration, deduplicated', async function () {
    const declaration = new Declaration(declarationWithBits)
    const nonces = declaration.intents[1].bitNoncePairs()
    expect(nonces.length).to.equal(1)
    expect(nonces[0].bit.index).to.equal(1n)
    expect(nonces[0].bit.value).to.equal(1n)
    expect(nonces[0].nonce).to.equal(257n)
  })
})

describe('Declaration.nonces()', function () {
  it('should return bits and nonce for declaration, deduplicated', async function () {
    const declaration = new Declaration(declarationWithBits)
    const nonces = declaration.bitNoncePairs()
    expect(nonces.length).to.equal(2)
    expect(nonces[0].bit.index).to.equal(0n)
    expect(nonces[0].bit.value).to.equal(1n)
    expect(nonces[0].nonce).to.equal(1n)
    expect(nonces[1].bit.index).to.equal(1n)
    expect(nonces[1].bit.value).to.equal(1n)
    expect(nonces[1].nonce).to.equal(257n)
  })

  it('should return empty array when declaration has no bits', async function () {
    const declaration = new Declaration(declarationWithoutBits)
    const nonces = declaration.bitNoncePairs()
    expect(nonces.length).to.equal(0)
  })

  it('should return bits and nonce for declaration, deduplicated', async function () {
    const declaration = new Declaration(declarationWithMixedBits)
    const nonces = declaration.bitNoncePairs()
    expect(nonces.length).to.equal(2)
    expect(nonces[0].bit.index).to.equal(0n)
    expect(nonces[0].bit.value).to.equal(1n)
    expect(nonces[0].nonce).to.equal(1n)
    expect(nonces[1].bit.index).to.equal(1n)
    expect(nonces[1].bit.value).to.equal(1n)
    expect(nonces[1].nonce).to.equal(257n)
  })
})

const declarationWithBits = {
  intents: [
    {
      segments: [
        { functionName: 'useBit', params: { index: BigInt(0), value: BigInt(1) } } as SegmentArgs,
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
        } as SegmentArgs
      ]
    },
    {
      segments: [
        { functionName: 'useBit', params: { index: BigInt(1), value: BigInt(1) } } as SegmentArgs,
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
        } as SegmentArgs
      ]
    },
    {
      segments: [
        { functionName: 'useBit', params: { index: BigInt(1), value: BigInt(1) } } as SegmentArgs,
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
        } as SegmentArgs
      ]
    }
  ],
  segmentsContract: SEGMENTS_01
}

const declarationWithoutBits = {
  intents: [
    {
      segments: [
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
        } as SegmentArgs
      ]
    },
  ],
  segmentsContract: SEGMENTS_01
}

const declarationWithMixedBits = {
  intents: [
    {
      segments: [
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
        } as SegmentArgs
      ]
    },
    {
      segments: [
        { functionName: 'useBit', params: { index: BigInt(0), value: BigInt(1) } } as SegmentArgs,
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
        } as SegmentArgs
      ]
    },
    {
      segments: [
        { functionName: 'useBit', params: { index: BigInt(1), value: BigInt(1) } } as SegmentArgs,
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
        } as SegmentArgs
      ]
    }
  ],
  segmentsContract: SEGMENTS_01
}
