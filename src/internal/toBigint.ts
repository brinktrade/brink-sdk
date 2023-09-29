import { BigIntish } from "@brinkninja/types";


export function toBigInt(value: BigIntish): bigint {
    if (typeof value === "number" && !Number.isInteger(value)) {
        throw new Error(`Cannot convert non-integer number ${value} to bigint.`);
    }

    try {
        return BigInt(value);
    } catch (error) { 
        throw new Error(`Failed to convert value "${value}" to bigint: ${error}`);
    }
}
