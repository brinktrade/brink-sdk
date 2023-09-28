export type BigIntish = bigint | string | number;

export function calculatePriceFromAmounts(amount0: BigIntish, amount1: BigIntish): number {
    if (Number(amount1) === 0) throw new Error("Division by zero");
    return Number(amount0) / Number(amount1);
}

export function convertPriceToX96Format(price: number): bigint {
    return BigInt(price * (2 ** 96));
}

export function bigintToHex(bn: bigint): string {
    return '0x' + bn.toString(16);
}

export function convertToX96HexPrice(tokenOutAmount: BigIntish, tokenInAmount: BigIntish): string {
    const price = calculatePriceFromAmounts(tokenOutAmount, tokenInAmount);
    const x96Price = convertPriceToX96Format(price);
    return bigintToHex(x96Price);
}
