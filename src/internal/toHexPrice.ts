import { BigIntish } from '@brinkninja/types'

const DECIMALS = 18;

export function convertToHexPrice (tokenOutAmount: BigIntish, tokenInAmount: BigIntish): string {
  const bigTokenOutAmount = convertToBigInt(tokenOutAmount);
  const bigTokenInAmount = convertToBigInt(tokenInAmount);

  const computedPrice = bigTokenOutAmount * (2n ** 96n) / bigTokenInAmount;
  const hexPrice = '0x' + computedPrice.toString(16);
  return hexPrice;
}

const convertToBigInt = (value: BigIntish): bigint => {
    if (typeof value === 'number') {
        return BigInt(Math.round(value * 10 ** DECIMALS));
    } else {
        return BigInt(value);
    }
}
