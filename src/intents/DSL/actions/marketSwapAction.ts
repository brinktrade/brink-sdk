import { MarketSwapActionArgs, SegmentArgs, TokenJSON } from '@brinkninja/types'
import { bigintToFeeAmount, toBigint, toTokenArgs } from '../../../internal'
import { UniV3Twap } from '../../../oracles'
import Token from '../../Token'

const DEFAULT_TIME_INTERVAL = BigInt(60)
const DEFAULT_FEE_MIN = BigInt(0)

function marketSwapAction ({
  owner,
  tokenIn,
  tokenOut,
  tokenInAmount,
  fee,
  twapInterval = DEFAULT_TIME_INTERVAL,
  twapFeePool = 0
}: MarketSwapActionArgs): SegmentArgs[] {
  const twapFeePoolBN = twapFeePool ? toBigint(twapFeePool) : undefined
  const twapFeePoolFeeAmount = twapFeePoolBN ? bigintToFeeAmount(twapFeePoolBN) : undefined
  const tokenInAmountBN = toBigint(tokenInAmount)

  const tokenInArgs = toTokenArgs(tokenIn)
  const tokenOutArgs = toTokenArgs(tokenOut)

  const twap = new UniV3Twap({
    tokenA: new Token(tokenInArgs),
    tokenB: new Token(tokenOutArgs),
    interval: twapInterval,
    fee: twapFeePoolFeeAmount,
  })

  const oracle = {
    address: twap.address,
    params: twap.params,
  }

  return [{
    functionName: 'marketSwapExactInput',
    params: {
      oracle: oracle,
      signer: owner,
      tokenIn: tokenInArgs as TokenJSON,
      tokenOut: tokenOutArgs as TokenJSON,
      tokenInAmount: tokenInAmountBN,
      feePercent: toBigint(fee * 10 ** 4),
      feeMin: DEFAULT_FEE_MIN,
    }
  }]
}

export default marketSwapAction
