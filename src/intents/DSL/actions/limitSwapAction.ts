import { padLeft } from 'web3-utils'
import { LimitSwapActionArgs, SegmentArgs, SegmentParamValue, TokenArgs } from '@brinkninja/types'
import { convertToX96HexPrice, toBigint, toTokenArgs } from '../../../internal'
import { InvalidInputError } from '../errors';

const FLAT_PRICE_CURVE_ADDRESS = '0xC509733B8dDdbab9369A96F6F216d6E59DB3900f';

// The `LimitSwapActionFunctionArgs` interface is specifically tailored for the `limitSwapAction` function,
// ensuring that the parameters it receives are of the correct type after the Joi validation has occurred.
// The need for this interface arises because, within the system's flow, `tokenIn` and `tokenOut` start as
// types that can either be a simple string or a more complex object (`TokenArgs`). However,
// once the Joi validation step is completed, these parameters are no longer simple strings; they are
// always objects with additional attributes necessary for the `limitSwapAction` function to operate correctly.
interface LimitSwapActionFunctionArgs extends Omit<LimitSwapActionArgs, 'tokenA' | 'tokenB'> {
  tokenIn: TokenArgs;
  tokenOut: TokenArgs;
}


function limitSwapAction ({
  id,
  owner,
  tokenIn,
  tokenOut,
  tokenInAmount,
  tokenOutAmount
}: LimitSwapActionFunctionArgs): SegmentArgs[] {
  if (tokenOutAmount === undefined) {
    throw new InvalidInputError('tokenOutAmount is required')
  }

  let tokenInAmountBN: bigint
  let tokenOutAmountBN: bigint
  try {
    tokenInAmountBN = toBigint(tokenInAmount)
    tokenOutAmountBN = toBigint(tokenOutAmount)
  } catch (error) {
    throw new InvalidInputError(`Failed to convert tokenInAmount or tokenOutAmount to bigint: ${error}`)
  }

  const hexPrice = padLeft(convertToX96HexPrice(tokenInAmountBN, tokenOutAmountBN), 64)
  const priceCurveParams = { address: FLAT_PRICE_CURVE_ADDRESS, params: hexPrice }
  
  const fillStateParams = {
    id: BigInt(id),
    sign: true,
    startX96: 0n
  }

  return [{
    functionName: 'limitSwapExactInput',
    params: {
      priceCurve: priceCurveParams,
      signer: owner,
      tokenIn: tokenIn as SegmentParamValue,
      tokenOut: tokenOut as SegmentParamValue,
      tokenInAmount: tokenInAmount,
      fillStateParams
    }
  }]
}

export default limitSwapAction
