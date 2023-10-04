import { FeeAmount } from "@uniswap/v3-sdk";

const validFeeAmounts = new Set(Object.values(FeeAmount));

export default function bigintToFeeAmount(value: bigint): FeeAmount {
    const numberValue = Number(value);

    if (!validFeeAmounts.has(numberValue)) {
        throw new Error('Invalid fee amount');
    }

    return numberValue as FeeAmount;
}
