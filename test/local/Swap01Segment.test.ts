import {
  Declaration,
  TokenArgs,
  SegmentArgs,
  SwapAmountArgs
} from '@brink-sdk'
import { expect } from 'chai'

const { SEGMENTS_01, SOLVER_VALIDATOR_01 } = require('@brinkninja/config').mainnet

describe('swap01', function () {
  it('should handle SwapAmount contract values', async function () {
    const declaration = await (new Declaration(swap01_validSwapAmounts)).toJSON()
    const swap01Params = (declaration.intents[0].segments[0] as any).params
    expect(swap01Params.inputAmount.contractName).to.equal('FixedSwapAmount01')
    expect(swap01Params.inputAmount.params[0]).to.equal('1000000000000000000')
    expect(swap01Params.outputAmount.contractName).to.equal('BlockIntervalDutchAuctionAmount01')
    expect(swap01Params.outputAmount.params[0]).to.equal('1000000000000000000')
    expect(swap01Params.outputAmount.params[1]).to.equal('12345')
    expect(swap01Params.outputAmount.params[2]).to.equal('19000000000')
    expect(swap01Params.outputAmount.params[3]).to.equal('15000')
    expect(swap01Params.outputAmount.params[4]).to.equal('1000')
    expect(swap01Params.outputAmount.params[5]).to.equal('100000')
    expect(swap01Params.outputAmount.params[6]).to.equal('-100000')
    expect(swap01Params.outputAmount.params[7]).to.equal('0x3b28d6ee052b65ed4d5230c1b2a9abaef031c648')
    expect(swap01Params.outputAmount.params[8]).to.equal('0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8')
  })

  it('should allow declaration with swap01 segment to be re-created with JSON output', async function () {
    const declarationJSON = await (new Declaration(swap01_validSwapAmounts)).toJSON()
    const declaration = await (new Declaration(declarationJSON)).toJSON()
    const swap01Params = (declaration.intents[0].segments[0] as any).params
    expect(swap01Params.inputAmount.contractName).to.equal('FixedSwapAmount01')
    expect(swap01Params.inputAmount.params[0]).to.equal('1000000000000000000')
    expect(swap01Params.outputAmount.contractName).to.equal('BlockIntervalDutchAuctionAmount01')
    expect(swap01Params.outputAmount.params[0]).to.equal('1000000000000000000')
    expect(swap01Params.outputAmount.params[1]).to.equal('12345')
    expect(swap01Params.outputAmount.params[2]).to.equal('19000000000')
    expect(swap01Params.outputAmount.params[3]).to.equal('15000')
    expect(swap01Params.outputAmount.params[4]).to.equal('1000')
    expect(swap01Params.outputAmount.params[5]).to.equal('100000')
    expect(swap01Params.outputAmount.params[6]).to.equal('-100000')
    expect(swap01Params.outputAmount.params[7]).to.equal('0x3b28d6ee052b65ed4d5230c1b2a9abaef031c648')
    expect(swap01Params.outputAmount.params[8]).to.equal('0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8')
  })
})


const swap01_validSwapAmounts = {
  intents: [
    {
      segments: [
        {
          functionName: 'swap01',
          params: {
            signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
            tokenIn: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } as TokenArgs,
            tokenOut: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' } as TokenArgs,
            inputAmount: {
              contractName: 'FixedSwapAmount01' as unknown,
              params: [
                1_000000000000000000n
              ]
            } as SwapAmountArgs,
            outputAmount: {
              contractName: 'BlockIntervalDutchAuctionAmount01' as unknown,
              params: [
                1_000000000000000000n,
                12345n,
                19_000_000_000n,
                15_000n,
                1_000n,
                100000n,
                -100000n,
                '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
                '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
              ]
            } as SwapAmountArgs,
            solverValidator: SOLVER_VALIDATOR_01
          }
        } as SegmentArgs
      ]
    }
  ],
  segmentsContract: SEGMENTS_01
}
