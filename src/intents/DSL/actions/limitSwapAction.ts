import { padLeft } from 'web3-utils'
import { LimitSwapActionArgs, SegmentArgs, SegmentParamValue, TokenArgs } from '@brinkninja/types'
import { convertToX96HexPrice, toBigint, toTokenArgs } from '../../../internal'
import { InvalidInputError } from '../errors';

const FLAT_PRICE_CURVE_ADDRESS = '0xC509733B8dDdbab9369A96F6F216d6E59DB3900f';

// tokenIn and tokenOut can be given as either a token symbol string or TokenArgs object. 
// If they are given as a token symbol string, Joi validation transforms them to a TokenArgs object
interface LimitSwapActionFunctionArgs extends Omit<LimitSwapActionArgs, 'tokenIn' | 'tokenOut'> {
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
  if (!tokenOutAmount) {
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
