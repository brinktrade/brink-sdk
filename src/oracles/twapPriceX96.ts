import { BigIntish } from "@brinkninja/types"

export type twapPriceX96Args = {
  price: number
  tokenA_decimals: BigIntish
  tokenB_decimals: BigIntish
}

export default function twapPriceX96 ({
  price,
  tokenA_decimals,
  tokenB_decimals
}: twapPriceX96Args): bigint {
  // twapPriceX96 = price * 2**96 * 10**(tokenB_decimals - tokenA_decimals)
  return BigInt(price * 2**96 * 10**(Number(tokenB_decimals) - Number(tokenA_decimals)))
}
