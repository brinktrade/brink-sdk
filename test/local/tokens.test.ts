import { expect } from 'chai'
import {
  Declaration,
  TokenArgs,
  SegmentArgs,
  DeclarationArgs,
  FillStateParamsArgs
} from '@brink-sdk'

const { SEGMENTS_01 } = require('@brinkninja/config').mainnet

const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const FLAT_PRICE_CURVE_ADDRESS = '0xc509733b8dddbab9369a96f6f216d6e59db3900f'

// hex representation of a DAI/WETH price 1/2200 * 2**96
const PRICE_CURVE_PARAMS = '0x0000000000000000000000000000000000000000001dca01dca01dca03000000'

describe('Intent.tokens()', function () {
  it('should return tokens with segmentIndex', async function () {
    const d = new Declaration(declaration1)
    const tokens = await d.intents[0].tokens()
    expect(tokens[0].segmentIndex).to.equal(1)
    expect(tokens[1].segmentIndex).to.equal(1)
  })

  it('should return tokens for marketSwap intent', async function () {
    const d = new Declaration(declaration1)
    const tokens = await d.intents[0].tokens()
    expect(tokens.length).to.equal(2)
    expect(tokens[0].token.address).to.equal(DAI_ADDRESS)
    expect(tokens[0].amount).to.equal(BigInt(1450_000000000000000000).toString())
    expect(tokens[1].token.address).to.equal(WETH_ADDRESS)
    expect(tokens[1].amount).to.be.undefined
  })

  it('should return tokens for limitSwap intent', async function () {
    const d = new Declaration(declaration1)
    const tokens = await d.intents[1].tokens()
    expect(tokens.length).to.equal(2)
    expect(tokens[0].token.address).to.equal(DAI_ADDRESS)
    expect(tokens[0].amount).to.equal(BigInt(2200_000000000000000000).toString())
    expect(tokens[1].token.address).to.equal(WETH_ADDRESS)
    expect(tokens[1].amount).to.equal(BigInt(1_000000000000000000).toString())
  })
})

describe('Declaration.tokens()', function () {
  it('should return tokens for the declaration with intent and segment indexes', async function () {
    const d = new Declaration(declaration1)
    const tokens = await d.tokens()
    expect(tokens.length).to.equal(4)
    expect(tokens[0].token.address).to.equal(DAI_ADDRESS)
    expect(tokens[0].amount).to.equal(BigInt(1450_000000000000000000).toString())
    expect(tokens[0].segmentIndex).to.equal(1)
    expect(tokens[0].intentIndex).to.equal(0)
    expect(tokens[1].token.address).to.equal(WETH_ADDRESS)
    expect(tokens[1].amount).to.be.undefined
    expect(tokens[1].segmentIndex).to.equal(1)
    expect(tokens[1].intentIndex).to.equal(0)
    expect(tokens[2].token.address).to.equal(DAI_ADDRESS)
    expect(tokens[2].amount).to.equal(BigInt(2200_000000000000000000).toString())
    expect(tokens[2].segmentIndex).to.equal(1)
    expect(tokens[2].intentIndex).to.equal(1)
    expect(tokens[3].token.address).to.equal(WETH_ADDRESS)
    expect(tokens[3].amount).to.equal(BigInt(1_000000000000000000).toString())
    expect(tokens[3].segmentIndex).to.equal(1)
    expect(tokens[3].intentIndex).to.equal(1)
  })
})

const declaration1: DeclarationArgs = {
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
            tokenIn: { address: DAI_ADDRESS } as TokenArgs,
            tokenOut: { address: WETH_ADDRESS } as TokenArgs,
            tokenInAmount: BigInt(1450_000000000000000000),
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
          functionName: 'limitSwapExactInput',
          params: {
            priceCurve: {
              address: FLAT_PRICE_CURVE_ADDRESS,
              params: PRICE_CURVE_PARAMS
            },
            signer: '0x8EB8a3b98659Cce290402893d0123abb75E3ab28',
            tokenIn: { address: DAI_ADDRESS } as TokenArgs,
            tokenOut: { address: WETH_ADDRESS } as TokenArgs,
            tokenInAmount: BigInt(2200_000000000000000000),
            fillStateParams: {
              id: BigInt(1),
              sign: true,
              startX96: BigInt(0)
            } as FillStateParamsArgs
          }
        } as SegmentArgs
      ]
    }
  ],
  segmentsContract: SEGMENTS_01
}
