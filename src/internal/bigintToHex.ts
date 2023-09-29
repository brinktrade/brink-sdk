export function bigintToHex(bn: bigint): string {
    return '0x' + bn.toString(16);
}
