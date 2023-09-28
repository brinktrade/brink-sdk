import { toTokenArgs } from '../../../internal/toTokenArgs'
import { LimitSwapActionArgs, PrimitiveArgs, PrimitiveParamValue } from '@brinkninja/types'
import { convertToX96HexPrice } from '@brink-sdk/internal/price';

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
    throw new Error('tokenOutAmount is required')
  }

  const hexPrice = convertToX96HexPrice(tokenOutAmount, tokenInAmount)
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
