import { Address, Bytes, Uint } from './SolidityTypes';

export function validateBytes(input: Bytes): void {
  const validHexPattern = /^0x([0-9a-fA-F][0-9a-fA-F])*$/;
  if (!validHexPattern.test(input)) {
    throw new Error(`Invalid Solidity bytes string: ${input}`);
  }
}

export function validateUint(input: Uint | BigInt, size: number = 256): void {
  if (size <= 0 || size > 256 || !Number.isInteger(size)) {
    throw new Error(`Invalid uint size: ${size}`);
  }

  const maxValue = BigInt(2 ** size) - 1n;

  if (input < 0n || input > maxValue) {
    throw new Error(`Value ${input} out of range for Solidity uint${size}`);
  }
}

export function validateAddress(address: Address): void {
  const validAddressPattern = /^0x[0-9a-fA-F]{40}$/;
  if (!validAddressPattern.test(address)) {
    throw new Error(`Invalid Solidity address ${address}`);
  }
}

export function validateFixedBytes(input: string, size: number): void {
  if (!isValidFixedBytes(input, size)) {
    throw new Error(`Invalid Solidity bytes{size} value`);
  }
}

function isValidFixedBytes(input: string, size: number): boolean {
  const validBytes32Pattern = /^0x[0-9a-fA-F]{size}$/;
  return validBytes32Pattern.test(input);
}

export function validateBoolean(input: boolean): void {
  if (typeof input !== 'boolean') {
    throw new Error(`Invalid Solidity boolean value`);
  }
}

export function validateEnum<T>(enumObject: Record<keyof T, number | string>, value: number | string): void {
  const enumValues = Object.values(enumObject);
  if (!enumValues.includes(value)) {
    throw new Error(`Invalid Solidity enum value for ${typeof enumObject}: ${value}`);
  }
}
