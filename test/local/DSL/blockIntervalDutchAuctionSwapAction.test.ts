import { expect } from 'chai';
const { SEGMENTS_01 } = require('@brinkninja/config').mainnet
import { Declaration } from '../../../src/intents'
import { blockIntervalDutchAuctionSwapAction, UniV3Twap, Token } from '../../../src';
import { USDC_TOKEN, WETH_TOKEN } from "../../helpers/tokens";

describe('blockIntervalDutchAuctionSwapAction', function () {

  it('should create correct block interval dutch auction swap action with provided twapFeePool', async function () {
    const inputParams = {
      owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
      tokenIn: USDC_TOKEN,
      tokenOut: WETH_TOKEN,
      tokenInAmount: 525_000000,
      intervalId: 12345,
      firstAuctionStartBlock: 20_000_000,
      auctionInterval: 10_000,
      auctionDuration: 100,
      startPercent: 50,
      endPercent: -50,
      twapFeePool: 500,
      maxAuctions: 5
    }
    const segments = blockIntervalDutchAuctionSwapAction({
      type: 'blockIntervalDutchAuctionSwap',
      ...inputParams
    });
    const declarationJSON = await (new Declaration({ intents: [ { segments } ], segmentsContract: SEGMENTS_01 })).toJSON()
    const segmentsJSON = declarationJSON.intents[0].segments
    const swap01Segment = segmentsJSON[0]
    const blockIntervalSegment = segmentsJSON[1]

    expect(swap01Segment.functionName).to.equal('swap01')
    expect(swap01Segment.params.signer).to.equal(inputParams.owner)
    expect(swap01Segment.params.tokenIn).to.deep.include({ address: USDC_TOKEN.address })
    expect(swap01Segment.params.tokenOut).to.deep.include({ address: WETH_TOKEN.address })

    const inputAmount: any = swap01Segment.params.inputAmount
    expect(inputAmount.contractName).to.equal('FixedSwapAmount01')
    expect(inputAmount.params.length).to.equal(1)
    expect(inputAmount.params[0]).to.equal(inputParams.tokenInAmount.toString())

    const outputAmount: any = swap01Segment.params.outputAmount
    expect(outputAmount.contractName).to.equal('BlockIntervalDutchAuctionAmount01')
    expect(outputAmount.params.length).to.equal(9)
    expect(outputAmount.params[0]).to.equal(inputParams.tokenInAmount.toString())
    expect(outputAmount.params[1]).to.equal(inputParams.intervalId.toString())
    expect(outputAmount.params[2]).to.equal(inputParams.firstAuctionStartBlock.toString())
    expect(outputAmount.params[3]).to.equal(inputParams.auctionInterval.toString())
    expect(outputAmount.params[4]).to.equal(inputParams.auctionDuration.toString())
    expect(outputAmount.params[5]).to.equal((inputParams.startPercent * 10**4).toString())
    expect(outputAmount.params[6]).to.equal((inputParams.endPercent * 10**4).toString())
    expect(outputAmount.params[7]).to.not.be.undefined
    expect(outputAmount.params[8]).to.not.be.undefined

    expect(blockIntervalSegment.functionName).to.equal('blockInterval')
    expect(blockIntervalSegment.params.id).to.equal(inputParams.intervalId.toString())
    expect(blockIntervalSegment.params.initialStart).to.equal('0')
    expect(blockIntervalSegment.params.intervalMinSize).to.equal(inputParams.auctionInterval.toString())
    expect(blockIntervalSegment.params.maxIntervals).to.equal(inputParams.maxAuctions.toString())
  });

  it('should create correct block interval dutch auction swap action without providing twapFeePool', async function () {
    const inputParams = {
      owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
      tokenIn: USDC_TOKEN,
      tokenOut: WETH_TOKEN,
      tokenInAmount: 525_000000,
      intervalId: 12345,
      firstAuctionStartBlock: 20_000_000,
      auctionInterval: 10_000,
      auctionDuration: 100,
      startPercent: 50,
      endPercent: -50,
      maxAuctions: 5
    }
    const segments = blockIntervalDutchAuctionSwapAction({
      type: 'blockIntervalDutchAuctionSwap',
      ...inputParams
    });
    const declarationJSON = await (new Declaration({ intents: [ { segments } ], segmentsContract: SEGMENTS_01 })).toJSON()
    const segmentsJSON = declarationJSON.intents[0].segments
    const swap01Segment = segmentsJSON[0]

    const twap = new UniV3Twap({
      tokenA: new Token({ address: USDC_TOKEN.address }),
      tokenB: new Token({ address: WETH_TOKEN.address }),
      interval: BigInt(60),
      fee: undefined,
    });

    const outputAmount: any = swap01Segment.params.outputAmount
    expect(outputAmount.params[7]).to.equal(twap.address)
    expect(outputAmount.params[8]).to.equal(twap.params)
  });

  it('should create correct block interval dutch auction swap action with a non-default twapInterval', async function () {
    const inputParams = {
      owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
      tokenIn: USDC_TOKEN,
      tokenOut: WETH_TOKEN,
      tokenInAmount: 525_000000,
      intervalId: 12345,
      firstAuctionStartBlock: 20_000_000,
      auctionInterval: 10_000,
      auctionDuration: 100,
      startPercent: 50,
      endPercent: -50,
      maxAuctions: 5,
      twapInterval: 2000n
    }
    const segments = blockIntervalDutchAuctionSwapAction({
      type: 'blockIntervalDutchAuctionSwap',
      ...inputParams
    });
    const declarationJSON = await (new Declaration({ intents: [ { segments } ], segmentsContract: SEGMENTS_01 })).toJSON()
    const segmentsJSON = declarationJSON.intents[0].segments
    const swap01Segment = segmentsJSON[0]

    const twap = new UniV3Twap({
      tokenA: new Token({ address: USDC_TOKEN.address }),
      tokenB: new Token({ address: WETH_TOKEN.address }),
      interval: 2000n,
      fee: undefined,
    });

    const outputAmount: any = swap01Segment.params.outputAmount
    expect(outputAmount.params[7]).to.equal(twap.address)
    expect(outputAmount.params[8]).to.equal(twap.params)
  });

  it('should create an intent declaration that is valid', async function () {
    const inputParams = {
      owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
      tokenIn: USDC_TOKEN,
      tokenOut: WETH_TOKEN,
      tokenInAmount: 525_000000,
      intervalId: 12345,
      firstAuctionStartBlock: 20_000_000,
      auctionInterval: 10_000,
      auctionDuration: 100,
      startPercent: 50,
      endPercent: -50,
      twapFeePool: 500,
      maxAuctions: 5
    }
    const segments = blockIntervalDutchAuctionSwapAction({
      type: 'blockIntervalDutchAuctionSwap',
      ...inputParams
    });
    const declaration = new Declaration({ intents: [ { segments } ], segmentsContract: SEGMENTS_01 })
    const validationRes = await declaration.validate()
    console.log('validationRes: ', validationRes)
    expect(validationRes.valid).to.equal(true)
  });
});
