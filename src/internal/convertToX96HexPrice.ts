import { bigintToHex } from "./bigintToHex";
import { calculateX96PriceFromAmounts } from "./calculateX96PriceFromAmounts";


export function convertToX96HexPrice(tokenOutAmount: bigint, tokenInAmount: bigint): string {
    const x96Price = calculateX96PriceFromAmounts(tokenOutAmount, tokenInAmount);
    return bigintToHex(x96Price);
}
