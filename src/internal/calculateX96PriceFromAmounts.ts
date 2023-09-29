export default function calculateX96PriceFromAmounts(baseAmount: bigint, quoteAmount: bigint): bigint {
  if(baseAmount === 0n) {
    throw new Error("Division by zero");
  }

  return (quoteAmount * (2n ** 96n)) / baseAmount;
}
