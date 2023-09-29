import { bigintToHex } from "./bigintToHex";
import { calculateX96PriceFromAmounts } from "./calculateX96PriceFromAmounts";


export function convertToX96HexPrice(quoteAmount: bigint, baseAmount: bigint): string {
    const x96Price = calculateX96PriceFromAmounts(quoteAmount, baseAmount);
    return bigintToHex(x96Price);
}
