import { BigIntish } from "@brinkninja/types";

export default function toBigint(value: BigIntish): bigint {
    try {
        return BigInt(value);
    } catch (error) { 
        throw new Error(`Failed to convert value "${value}" to bigint: ${error}`);
    }
}
