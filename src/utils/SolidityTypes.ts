export type Bytes = `0x${string}`
export type Bytes32 = `0x${Repeat<HexPair, 32>}`
export type Address = `0x${Repeat<HexPair, 20>}`
export type Uint = BigInt

export type HexDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

export type HexPair = `${HexDigit}${HexDigit}`

export type Repeat<T extends string, N extends number, A extends any[] = []> = A['length'] extends N
  ? T
  : Repeat<T, N, [T, ...A]>
