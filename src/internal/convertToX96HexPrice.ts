import bigintToHex from "./bigintToHex";
import calculateX96PriceFromAmounts from "./calculateX96PriceFromAmounts";


export default function convertToX96HexPrice(baseAmount: bigint, quoteAmount: bigint): string {
    const x96Price = calculateX96PriceFromAmounts(baseAmount, quoteAmount);
    return bigintToHex(x96Price);
}
