import { MarketSwapActionArgs, SegmentArgs, TokenArgs, TokenJSON } from '@brinkninja/types'
import { bigintToFeeAmount, toBigint, toTokenArgs } from '../../../internal'
import { UniV3Twap } from '../../../oracles'
import Token from '../../Token'

const DEFAULT_TIME_INTERVAL = BigInt(60)
const DEFAULT_FEE_MIN = BigInt(0)

// The `MarketSwapActionFunctionArgs` interface is specifically tailored for the `marketSwapAction` function,
// ensuring that the parameters it receives are of the correct type after the Joi validation has occurred.
// The need for this interface arises because, within the system's flow, `tokenIn` and `tokenOut` start as
// types that can either be a simple string or a more complex object (`TokenArgs`). However,
// once the Joi validation step is completed, these parameters are no longer simple strings; they are
// always objects with additional attributes necessary for the `marketSwapAction` function to operate correctly.
interface MarketSwapActionFunctionArgs extends Omit<MarketSwapActionArgs, 'tokenA' | 'tokenB'> {
  tokenIn: TokenArgs;
  tokenOut: TokenArgs;
}

function marketSwapAction ({
  owner,
  tokenIn,
  tokenOut,
  tokenInAmount,
  fee,
  twapInterval = DEFAULT_TIME_INTERVAL,
  twapFeePool = 0
}: MarketSwapActionFunctionArgs): SegmentArgs[] {
  const twapFeePoolBN = twapFeePool ? toBigint(twapFeePool) : undefined
  const twapFeePoolFeeAmount = twapFeePoolBN ? bigintToFeeAmount(twapFeePoolBN) : undefined
  const tokenInAmountBN = toBigint(tokenInAmount)

  console.log("@@@@@tokenIn", tokenIn)
  console.log("@@@@@tokenOut", tokenOut)
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
