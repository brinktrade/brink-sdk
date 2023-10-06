import { LimitSwapActionArgs, SegmentArgs, SegmentParamValue } from '@brinkninja/types'
import { convertToX96HexPrice, toBigint, toTokenArgs } from '../../../internal'
import { InvalidInputError } from '../errors';

const FLAT_PRICE_CURVE_ADDRESS = '0xC509733B8dDdbab9369A96F6F216d6E59DB3900f';

function limitSwapAction ({
  id,
  owner,
  tokenIn,
  tokenOut,
  tokenInAmount,
  tokenOutAmount
}: LimitSwapActionArgs): SegmentArgs[] {
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

  const hexPrice = convertToX96HexPrice(tokenInAmountBN, tokenOutAmountBN)
  const priceCurveParams = { address: FLAT_PRICE_CURVE_ADDRESS, params: hexPrice }
  
  const tokenInArgs = toTokenArgs(tokenIn)
  const tokenOutArgs = toTokenArgs(tokenOut)

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
      tokenIn: tokenInArgs as SegmentParamValue,
      tokenOut: tokenOutArgs as SegmentParamValue,
      tokenInAmount: tokenInAmount,
      fillStateParams
    }
  }]
}

export default limitSwapAction