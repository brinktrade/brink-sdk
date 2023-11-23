import { MarketSwapActionArgs, SegmentArgs, TokenArgs, TokenJSON } from '@brinkninja/types'
import { bigintToFeeAmount, toBigint, toTokenArgs } from '../../../internal'
import { UniV3Twap } from '../../../oracles'
import Token from '../../Token'

const DEFAULT_TIME_INTERVAL = BigInt(60)
const DEFAULT_FEE_MIN = BigInt(0)

// tokenIn and tokenOut can be given as either a token symbol string or TokenArgs object. 
// If they are given as a token symbol string, Joi validation transforms them to a TokenArgs object
interface MarketSwapActionFunctionArgs extends Omit<MarketSwapActionArgs, 'tokenIn' | 'tokenOut'> {
  tokenIn: TokenArgs;
  tokenOut: TokenArgs;
}

function marketSwapAction ({
  owner,
  tokenIn,
  tokenOut,
  tokenInAmount,
  fee,
  twapInterval,
  twapFeePool = 0
}: MarketSwapActionFunctionArgs): SegmentArgs[] {
  if(!twapInterval) twapInterval = DEFAULT_TIME_INTERVAL
  const twapFeePoolBN = twapFeePool ? toBigint(twapFeePool) : undefined
  const twapFeePoolFeeAmount = twapFeePoolBN ? bigintToFeeAmount(twapFeePoolBN) : undefined
  const tokenInAmountBN = toBigint(tokenInAmount)

  const twap = new UniV3Twap({
    tokenA: new Token(tokenIn),
    tokenB: new Token(tokenOut),
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
      tokenIn: tokenIn as TokenJSON,
      tokenOut: tokenOut as TokenJSON,
      tokenInAmount: tokenInAmountBN,
      feePercent: toBigint(fee * 10 ** 4),
      feeMin: DEFAULT_FEE_MIN,
    }
  }]
}

export default marketSwapAction
