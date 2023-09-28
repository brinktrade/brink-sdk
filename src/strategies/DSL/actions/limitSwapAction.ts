import { toTokenArgs } from '../../../internal/toTokenArgs'
import { LimitSwapActionArgs, PrimitiveArgs, PrimitiveParamValue } from '@brinkninja/types'
import priceCurveAddress from '../../../internal/priceCurveAddress'
import { convertToHexPrice } from '@brink-sdk/internal/toHexPrice';

const DEFAULT_PRICE_CURVE = 'flat';

let globalPriceCurveAddress: string | null = null;
let addressFetchInitiated = false;

function ensurePriceCurveAddressInitialized(): void {
  if (!addressFetchInitiated) {
    addressFetchInitiated = true; // To prevent multiple fetch attempts
    priceCurveAddress(DEFAULT_PRICE_CURVE)
      .then(result => {
        globalPriceCurveAddress = result;
      })
      .catch(err => {
        console.error("Error fetching price curve address:", err);
      });
  }
}

function limitSwapAction ({
  id,
  owner,
  tokenIn,
  tokenOut,
  tokenInAmount,
  tokenOutAmount
}: LimitSwapActionArgs): PrimitiveArgs[] {
  ensurePriceCurveAddressInitialized();  // Ensure fetch attempt has been made
  
  if (!globalPriceCurveAddress) {
    throw new Error('Price curve address not initialized.');
  }

  if (tokenOutAmount === undefined) {
    throw new Error('tokenOutAmount is required')
  }

  const hexPrice = convertToHexPrice(tokenOutAmount, tokenInAmount)
  const priceCurveParams = { address: globalPriceCurveAddress, params: hexPrice }
  
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
      signer: owner, // TODO: Check
      tokenIn: tokenArgsIn as PrimitiveParamValue, 
      tokenOut: tokenArgsOut as PrimitiveParamValue,
      tokenInAmount: tokenInAmount,
      fillStateParams
    }
  }]
}

export default limitSwapAction
