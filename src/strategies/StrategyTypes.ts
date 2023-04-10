export type ContractCallParams = (
  boolean | string | BigInt | SignatureTypeEnum | Token | PrimitiveStruct | CallStruct | ContractCallParams
)[]

export enum SignatureTypeEnum {
  EIP712 = 0,
  EIP1271 = 1
}

export type SignatureType = 'EIP712' | 'EIP1271'

export enum TokenStandard {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
  ETH = 3
}

export type Token = {
  standard: TokenStandard
  addr: string
  idsMerkleRoot: string
  id: BigInt
  disallowFlagged: boolean
}

export type PrimitiveFunctionName = 
  'useBit' |
  'marketSwapExactInput' |
  'requireBlockNotMined' |
  'requireUint256LowerBound'

export type PrimitiveType =
  'swap' |
  'require'

export type PrimitiveData = {
  functionName: PrimitiveFunctionName
  params: ContractCallParams
  data?: string
  requiresUnsignedCall?: boolean
}

export type OrderData = {
  primitives: PrimitiveData[]
  data?: string
}

export type StrategyData = {
  orders: OrderData[]
  beforeCalls: any[]
  afterCalls: any[]
  primitivesContract: string,
  data?: string
}

export type SignedStrategyData = {
  hash: string
  account: string
  signer: string
  chainId: BigInt
  signatureType: SignatureType
  signature: string
  strategy: StrategyData,
  strategyContract: string
}

export type PrimitiveStruct = {
  data: string
  requiresUnsignedCall: boolean
}

export type CallStruct = {
  targetContract: string
  data: string
}

export type ValidationResult = {
  valid: boolean
  reason?: InvalidReason
  message?: string
}

export type InvalidReason = keyof typeof invalidReasonMessages

export const invalidReasonMessages = {
  ZERO_ORDERS: 'Strategy must have at least 1 order',
  WRONG_NUMBER_OF_SWAPS: 'All orders must have exactly 1 swap',
  SIGNATURE_MISMATCH: 'Signer address does not match recovered address from signature',
  ACCOUNT_MISMATCH: 'Account address is not owned by signer',
  HASH_MISMATCH: 'Hash does not match strategy data'
}
