import { LimitSwapActionArgs, PrimitiveArgs, PrimitiveParamValue } from '@brinkninja/types'
import { convertToX96HexPrice, toBigint, toTokenArgs } from '@brink-sdk/internal';
import { InvalidInputError } from '../InvalidInputError';

const FLAT_PRICE_CURVE_ADDRESS = '0xC509733B8dDdbab9369A96F6F216d6E59DB3900f';

function limitSwapAction ({
  id,
  owner,
  tokenIn,
  tokenOut,
  tokenInAmount,
  tokenOutAmount
}: LimitSwapActionArgs): PrimitiveArgs[] {
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
  
  const tokenArgsIn = toTokenArgs(tokenIn)
  const tokenArgsOut = toTokenArgs(tokenOut)

  const fillStateParams = {
    id,
    sign: true,
    startX96: 0n
  }

  return [{
    functionName: 'limitSwapExactInput',
    params: {
      priceCurve: priceCurveParams,
      signer: owner,
      tokenIn: tokenArgsIn as PrimitiveParamValue, 
      tokenOut: tokenArgsOut as PrimitiveParamValue,
      tokenInAmount: tokenInAmount,
      fillStateParams
    }
  }]
}

export default limitSwapAction
