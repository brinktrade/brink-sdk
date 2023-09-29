export function calculateX96PriceFromAmounts(quoteAmount: bigint, baseAmount: bigint): bigint {
  if(baseAmount === 0n) {
    throw new Error("Division by zero");
  }

  return (quoteAmount * (2n ** 96n)) / baseAmount;
}
