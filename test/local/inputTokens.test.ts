import { expect } from 'chai'
import {
  IntentGroup,
  TokenArgs,
  SegmentArgs
} from '@brink-sdk'

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

describe('IntentGroupIntent.inputTokens()', function () {
  it('should return tokenInputs for intent', async function () {
    const intentGroup1 = new IntentGroup(intentGroupForTokenInputs1)
    const tokenInputs = intentGroup1.intents[0].tokenInputs()
    expect(tokenInputs.length).to.equal(1)
    expect(tokenInputs[0].token.address).to.equal(USDC_ADDRESS)
    expect(tokenInputs[0].amount).to.equal(BigInt(1450000000).toString())
  })
})

describe('IntentGroup.inputTokens()', function () {
  it('should return tokenInputs for the intentGroup with amounts summed', async function () {
    const intentGroup1 = new IntentGroup(intentGroupForTokenInputs1)
    const tokenInputs = intentGroup1.tokenInputs()
    expect(tokenInputs.length).to.equal(2)
    expect(tokenInputs[0].token.address).to.equal(USDC_ADDRESS)
    expect(tokenInputs[0].amount).to.equal(BigInt(2450000000).toString())
    expect(tokenInputs[1].token.address).to.equal(WETH_ADDRESS)
    expect(tokenInputs[1].amount).to.equal(BigInt(1200000000).toString())
  })
})

const intentGroupForTokenInputs1 = {
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
  ]
}
