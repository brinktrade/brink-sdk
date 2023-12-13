import Config from '../../../Config'
import { SwapAmountArgs, SegmentParamValue, SegmentArgs, TokenWithDecimalsArgs, BlockIntervalDutchAuctionSwapActionArgs } from '@brinkninja/types'
import { bigintToFeeAmount, toBigint } from '../../../internal'
import { UniV3Twap } from '../../../oracles'
import Token from '../../Token'

const { SOLVER_VALIDATOR_01 } = Config

const DEFAULT_TWAP_INTERVAL = 60n

interface BlockIntervalDutchAuctionSwapActionFnArgs extends Omit<BlockIntervalDutchAuctionSwapActionArgs, 'tokenIn' | 'tokenOut'> {
  tokenIn: TokenWithDecimalsArgs
  tokenOut: TokenWithDecimalsArgs
}

function blockIntervalDutchAuctionSwap ({
  owner,
  tokenIn,
  tokenOut,
  tokenInAmount,
  intervalId,
  firstAuctionStartBlock,
  auctionInterval,
  auctionDuration,
  startPercent,
  endPercent,
  twapFeePool,
  twapInterval = DEFAULT_TWAP_INTERVAL,
  maxAuctions
}: BlockIntervalDutchAuctionSwapActionFnArgs): SegmentArgs[] {

  const twapFeePoolBN = twapFeePool ? toBigint(twapFeePool) : undefined
  const fee = twapFeePoolBN ? bigintToFeeAmount(twapFeePoolBN) : undefined

  const twap = new UniV3Twap({
    tokenA: new Token(tokenIn),
    tokenB: new Token(tokenOut),
    interval: twapInterval,
    fee: fee,
  })

  const inputAmount: SwapAmountArgs = {
    contractName: 'FixedSwapAmount01',
    params: [
      tokenInAmount.toString()
    ]
  }
  const outputAmount: SwapAmountArgs = {
    contractName: 'BlockIntervalDutchAuctionAmount01',
    params: [
      tokenInAmount.toString(), // oppositeTokenAmount
      intervalId.toString(), // blockIntervalId
      firstAuctionStartBlock.toString(),
      auctionInterval.toString(), // auctionDelayBlocks: # of blocks between prev auction end and next auction start
      auctionDuration.toString(), // auctionDurationBlocks: # of blocks
      toBigint(startPercent * 10 ** 4), // percentage above TWAP to start auction
      toBigint(endPercent * 10 ** 4), // percentage below TWAP to end auction
      twap.address, // priceX96Oracle (TWAP for tokenIn/tokenOut)
      twap.params // priceX96OracleParams (calldata for TWAP)
    ]
  }

  return [
    {
      functionName: 'swap01',
      params: {
        signer: owner,
        tokenIn: tokenIn as SegmentParamValue,
        tokenOut: tokenOut as SegmentParamValue,
        inputAmount,
        outputAmount,
        solverValidator: SOLVER_VALIDATOR_01
      }
    },
    {
      functionName: 'blockInterval',
      params: {
        id: intervalId,
        initialStart: 0, // start immediately .. if we want to delay or start earlier, `firstAuctionStartBlock` can be used for this
        intervalMinSize: auctionInterval, // disallows execution until the auctionDelay period is over
        maxIntervals: maxAuctions || 0
      }
    }
  ]
}

export default blockIntervalDutchAuctionSwap
