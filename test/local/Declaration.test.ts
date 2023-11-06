import { expect } from 'chai'
import { FeeAmount } from '@uniswap/v3-sdk'
import {
  Declaration,
  DeclarationIntent,
  UseBit,
  MarketSwapExactInput,
  RequireUint256LowerBound,
  UniV3Twap,
  Token,
  TokenArgs,
  Config,
  SegmentArgs,
  OracleJSON,
  DeclarationArgs,
  FillStateParamsArgs
} from '@brink-sdk'
import { DAI_TOKEN as DAI_DETAILS, USDC_TOKEN as USDC_DETAILS, WETH_TOKEN as WETH_DETAILS } from "../helpers/tokens";

const { MAX_UINT256 } = require('@brinkninja/utils').constants

const { TWAP_ADAPTER_02 } = Config

const USDC_TOKEN = new Token({ address: USDC_DETAILS.address})
const WETH_TOKEN = new Token({ address: WETH_DETAILS.address })
const DAI_TOKEN =  new Token({ address: DAI_DETAILS.address })

const FLAT_PRICE_CURVE_ADDRESS = '0xc509733b8dddbab9369a96f6f216d6e59db3900f'
const PRICE_CURVE_PARAMS = '0x0000000000000000000000000000000000000000000d1b71758e219680000000' //hex representation of a DAI/WETH price, 0.0002 WETH as x96, x96 price = 0.0002 * 2**96 = 15845632502852868278059008

describe('Declarations', function () {
  it('should build basic declaration and convert to JSON', async function () {
    const declaration1 = new Declaration(validDeclaration1)
    const declarationJSON = await declaration1.toJSON()
    expect(declarationJSON.intents.length).to.equal(1)
    expect(declarationJSON.intents[0].segments.length).to.equal(4)
  })

  it('should build basic limitSwapExactInput and convert to JSON', async function () {
    const declaration1 = new Declaration(validLimitSwapExactInput)
    const declarationJSON = await declaration1.toJSON()
    expect(declarationJSON.intents.length).to.equal(1)
    expect(declarationJSON.intents[0].segments.length).to.equal(3)
  })

  it('should build blockInterval segment and convert to JSON', async function () {
    const declaration1 = new Declaration(validSwapOnBlockInterval)
    const declarationJSON = await declaration1.toJSON()
    expect(declarationJSON.intents.length).to.equal(1)
    expect(declarationJSON.intents[0].segments.length).to.equal(2)
  })

  it('declaration JSON serialize/deserialize should succeed', async function () {
    const declaration1 = new Declaration(validDeclaration1)
    const declaration1JSON = await declaration1.toJSON()
    const json1Str = JSON.stringify(declaration1JSON)
    expect(json1Str).not.to.be.undefined

    const declaration2 = new Declaration(declaration1JSON as DeclarationArgs)
    const declaration2JSON = await declaration2.toJSON()
    const json2Str = JSON.stringify(declaration2JSON)
    expect(json2Str).to.deep.equal(json1Str)
  })

  it('should build declaration using Oracle segment param classes', async function () {
    const declaration1 = new Declaration()

    const usdc_weth_500_twap = new UniV3Twap({
      tokenA: USDC_TOKEN,
      tokenB: WETH_TOKEN,
      interval: BigInt(3600),
      fee: FeeAmount.LOW
    })

    declaration1.intents[0] = new DeclarationIntent()
    declaration1.intents[0].segments[0] = new UseBit({
      index: BigInt(0),
      value: BigInt(1)
    })
    declaration1.intents[0].segments[1] = new RequireUint256LowerBound({
      oracle: usdc_weth_500_twap,
      lowerBound: BigInt(1000) * BigInt(2)**BigInt(96)
    })
    declaration1.intents[0].segments[2] = new MarketSwapExactInput({
      oracle: usdc_weth_500_twap,
      signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
      tokenIn: USDC_TOKEN,
      tokenOut: WETH_TOKEN,
      tokenInAmount: BigInt(1000) * BigInt(10)**BigInt(6),
      feePercent: 1000,
      feeMin: BigInt(0)
    })

    const declarationJSON = await declaration1.toJSON()
    expect((declarationJSON.intents[0].segments[2].params.oracle as OracleJSON).address).to.equal(TWAP_ADAPTER_02)
  })

  it('should build declaration with requireBitUsed segment', async function () {
    const declarationJSON = await new Declaration(requireBitUsedDeclaration).toJSON()
    expect(declarationJSON.intents[0].segments[0].functionName).to.equal('requireBitUsed')
  })

  it('should build declaration with requireBitNotUsed segment', async function () {
    const declarationJSON = await new Declaration(requireBitNotUsedDeclaration).toJSON()
    expect(declarationJSON.intents[0].segments[0].functionName).to.equal('requireBitNotUsed')
  })

  describe('validate()', function () {
    it('should return valid for valid declaration', async function () {
      const declaration = new Declaration(validDeclaration1)
      expect(declaration.validate().valid).to.be.true
    })

    it('empty declaration should be invalid', async function () {
      const declaration = new Declaration()
      expect(declaration.validate().valid).to.be.false
      expect(declaration.validate().reason).to.equal('ZERO_INTENTS')
    })

    it('intent with more than one swap should be invalid', function () {
      const declaration = new Declaration()
      declaration.intents[0] = new DeclarationIntent()
      declaration.intents[0].segments[0] = new MarketSwapExactInput({
        oracle: {
          address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
          params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
        },
        signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
        tokenIn: USDC_TOKEN,
        tokenOut: WETH_TOKEN,
        tokenInAmount: BigInt(1000) * BigInt(10)**BigInt(6),
        feePercent: 5,
        feeMin: BigInt(0)
      })
      declaration.intents[0].segments[1] = new MarketSwapExactInput({
        oracle: {
          address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
          params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
        },
        signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
        tokenIn: USDC_TOKEN,
        tokenOut: WETH_TOKEN,
        tokenInAmount: BigInt(1000) * BigInt(10)**BigInt(6),
        feePercent: 5,
        feeMin: BigInt(0)
      })
      expect(declaration.validate().valid).to.be.false
      expect(declaration.validate().reason).to.equal('WRONG_NUMBER_OF_SWAPS')
    })

    it('intent with zero swaps should be invalid', function () {
      const declaration = new Declaration()
      declaration.intents[0] = new DeclarationIntent()
      declaration.intents[0].segments[0] = new UseBit({ index: BigInt(0), value: BigInt(1) })
      expect(declaration.validate().valid).to.be.false
      expect(declaration.validate().reason).to.equal('WRONG_NUMBER_OF_SWAPS')
    })

    it('uint overflow should throw an error', function () {
      const declaration = new Declaration()
      declaration.intents[0] = new DeclarationIntent()
      expect(createSwapDeclarationWithUintOverflow.bind(this)).to.throw('out of range for Solidity uint256')  
      
      function createSwapDeclarationWithUintOverflow () {
        new MarketSwapExactInput({
          oracle: {
            address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
            params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
          },
          signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
          tokenIn: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } as TokenArgs,
          tokenOut: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' } as TokenArgs,
          tokenInAmount: BigInt(MAX_UINT256) + BigInt(1), // uint overflow
          feePercent: 5,
          feeMin: BigInt(0)
        })
      }
    })

    it('uint under 0 should throw an error', function () {
      const declaration = new Declaration()
      declaration.intents[0] = new DeclarationIntent()
      expect(createSwapDeclarationWithUintOverflow.bind(this)).to.throw('out of range for Solidity uint256')  
      
      function createSwapDeclarationWithUintOverflow () {
        new MarketSwapExactInput({
          oracle: {
            address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
            params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
          },
          signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
          tokenIn: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } as TokenArgs,
          tokenOut: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' } as TokenArgs,
          tokenInAmount: -BigInt(10**18),
          feePercent: 5,
          feeMin: BigInt(0)
        })
      }
    })
  })
})

const validDeclaration1 = {
  intents: [
    {
      segments: [
        {
          functionName: 'useBit',
          params: {
            index: BigInt(0),
            value: BigInt(1)
          }
        } as SegmentArgs,
        {
          functionName: 'requireBlockNotMined',
          params: {
            blockNumber: BigInt(169832100000000)
          }
        } as SegmentArgs,
        {
          functionName: 'requireUint256LowerBound',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            lowerBound: BigInt(1000) * BigInt(2)**BigInt(96)
          }
        } as SegmentArgs,
        {
          functionName: 'marketSwapExactInput',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } as TokenArgs,
            tokenOut: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' } as TokenArgs,
            tokenInAmount: BigInt(1450000000),
            feePercent: BigInt(10000),
            feeMin: BigInt(0)
          }
        } as SegmentArgs
      ]
    }
  ]
}

const validLimitSwapExactInput = {
  intents: [
    {
      segments: [
        {
          functionName: 'useBit',
          params: {
            index: BigInt(0),
            value: BigInt(1)
          }
        } as SegmentArgs,
        {
          functionName: 'requireBlockNotMined',
          params: {
            blockNumber: BigInt(169832100000000)
          }
        } as SegmentArgs,
        {
          functionName: 'limitSwapExactInput',
          params: {
            priceCurve: {
              address: FLAT_PRICE_CURVE_ADDRESS,
              params: PRICE_CURVE_PARAMS
            },
            signer: '0x8EB8a3b98659Cce290402893d0123abb75E3ab28',
            tokenIn: { address: '0x6b175474e89094c44da98b954eedeac495271d0f' } as TokenArgs,
            tokenOut: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' } as TokenArgs,
            tokenInAmount: BigInt(1000_000000000000000000),
            fillStateParams: {
              id: BigInt(1),
              sign: true,
              startX96: BigInt(0)
            } as FillStateParamsArgs
          }
        } as SegmentArgs
      ]
    }
  ]
}

const validSwapOnBlockInterval = {
  intents: [
    {
      segments: [
        {
          functionName: 'blockInterval',
          params: {
            id: BigInt(123456789),
            initialStart: BigInt(0),
            intervalMinSize: BigInt(100),
            maxIntervals: BigInt(0)
          }
        } as SegmentArgs,
        {
          functionName: 'marketSwapExactInput',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } as TokenArgs,
            tokenOut: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' } as TokenArgs,
            tokenInAmount: BigInt(1450000000),
            feePercent: BigInt(10000),
            feeMin: BigInt(0)
          }
        } as SegmentArgs
      ]
    }
  ]
}

const requireBitUsedDeclaration = {
  intents: [
    {
      segments: [
        {
          functionName: 'requireBitUsed',
          params: {
            index: BigInt(0),
            value: BigInt(1)
          }
        } as SegmentArgs,
        {
          functionName: 'marketSwapExactInput',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } as TokenArgs,
            tokenOut: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' } as TokenArgs,
            tokenInAmount: BigInt(1450000000),
            feePercent: BigInt(10000),
            feeMin: BigInt(0)
          }
        } as SegmentArgs
      ]
    }
  ]
}

const requireBitNotUsedDeclaration = {
  intents: [
    {
      segments: [
        {
          functionName: 'requireBitNotUsed',
          params: {
            index: BigInt(0),
            value: BigInt(1)
          }
        } as SegmentArgs,
        {
          functionName: 'marketSwapExactInput',
          params: {
            oracle: {
              address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
              params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
            },
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } as TokenArgs,
            tokenOut: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' } as TokenArgs,
            tokenInAmount: BigInt(1450000000),
            feePercent: BigInt(10000),
            feeMin: BigInt(0)
          }
        } as SegmentArgs
      ]
    }
  ]
}
