import { BigIntish } from "@brinkninja/types"

export type twapValueToPriceArgs = {
  twapValue: BigIntish
  tokenA_decimals: BigIntish
  tokenB_decimals: BigIntish
}

// converts a price decimal number (e.g. 0.0006) to a TWAP value
export default function twapValueToPrice ({
  twapValue,
  tokenA_decimals,
  tokenB_decimals
}: twapValueToPriceArgs): number {
  // price = twapValue / 2**96 / 10**(tokenB_decimals - tokenA_decimals)
  return Number(twapValue) / 2**96 / 10**(Number(tokenB_decimals) - Number(tokenA_decimals))
}
