import { BigIntish } from '@brinkninja/types'

export function validateBytes(paramName: string, input: string): void {
  const validHexPattern = /^0x([0-9a-fA-F][0-9a-fA-F])*$/;
  if (!validHexPattern.test(input)) {
    throw new Error(`${paramName}: Invalid Solidity bytes string: ${input}`);
  }
}

export function validateUint(paramName: string, input: BigIntish, size: number = 256): void {
  if (size <= 0 || size > 256 || !Number.isInteger(size)) {
    throw new Error(`${paramName}: Invalid uint size: ${size}`);
  }

  const maxValue = BigInt(2)**BigInt(size) - 1n;

  if (BigInt(input) < 0n || BigInt(input) > maxValue) {
    throw new Error(`${paramName}: Value ${input} out of range for Solidity uint${size}`);
  }
}

export function validateAddress(paramName: string, address: string): void {
  const validAddressPattern = /^0x[0-9a-fA-F]{40}$/;
  if (!validAddressPattern.test(address)) {
    throw new Error(`${paramName}: Invalid Solidity address ${address}`);
  }
}

export function validateFixedBytes(paramName: string, input: string, size: number): void {
  if (!isValidFixedBytes(input, size)) {
    throw new Error(`${paramName}: Invalid Solidity bytes{size} value`);
  }
}

function isValidFixedBytes(input: string, size: number): boolean {
  const validBytes32Pattern = /^0x[0-9a-fA-F]{size}$/;
  return validBytes32Pattern.test(input);
}

export function validateBoolean(paramName: string, input: boolean): void {
  if (typeof input !== 'boolean') {
    throw new Error(`${paramName}: Invalid Solidity boolean value`);
  }
}

export function validateEnum<T>(paramName: string, enumObject: Record<keyof T, number | string>, value: number | string): void {
  const enumValues = Object.values(enumObject);
  if (!enumValues.includes(value)) {
    throw new Error(`${paramName}: Invalid Solidity enum value for ${typeof enumObject}: ${value}`);
  }
}
