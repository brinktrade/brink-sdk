import { BigIntish } from "@brinkninja/types"

export type priceToTwapValueArgs = {
  price: number
  tokenA_decimals: BigIntish
  tokenB_decimals: BigIntish
}

// converts a price decimal number (e.g. 0.0006) to a TWAP value
export default function priceToTwapValue ({
  price,
  tokenA_decimals,
  tokenB_decimals
}: priceToTwapValueArgs): bigint {
  // twapValue = price * 2**96 * 10**(tokenB_decimals - tokenA_decimals)
  return BigInt(price * 2**96 * 10**(Number(tokenB_decimals) - Number(tokenA_decimals)))
}
