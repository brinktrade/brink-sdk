export function calculateX96PriceFromAmounts(amount0: bigint, amount1: bigint): bigint {
  if(amount1 === 0n) {
    throw new Error("Division by zero");
  }

  return (amount0 * (2n ** 96n)) / amount1;
}
