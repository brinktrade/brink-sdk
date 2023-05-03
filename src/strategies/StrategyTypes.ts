export type ContractCallParams = (
  BigInt | boolean | string | SignatureTypeEnum | TokenStruct | TokenJSON | IdsProofStruct | PrimitiveStruct | CallStruct | ContractCallParams
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

export type TokenStruct = {
  standard: TokenStandard
  addr: string
  idsMerkleRoot: string
  id: BigInt
  disallowFlagged: boolean
}

export type TokenJSON = {
  standard: TokenStandard
  addr: string
  idsMerkleRoot: string
  id: string
  disallowFlagged: boolean
}

export type IdsProofStruct = {
  ids: BigInt[]
  merkleProof_hashes: string[]
  merkleProof_flags: boolean[]
  statusProof_lastTransferTimes: BigInt[]
  statusProof_timestamps: BigInt[]
  statusProof_signatures: string[];
}

export type PrimitiveFunctionName = 
  'useBit' |
  'marketSwapExactInput' |
  'requireBlockNotMined' |
  'requireUint256LowerBound'

export type PrimitiveType =
  'swap' |
  'require'

export type PrimitiveJSON = {
  functionName: PrimitiveFunctionName
  params: ContractCallParams
  data?: string
  requiresUnsignedCall?: boolean
}

export type OrderJSON = {
  data?: string
  index: number
  primitives: PrimitiveJSON[]
}

export type StrategyJSON = {
  orders: OrderJSON[]
  beforeCalls?: any[]
  afterCalls?: any[]
  primitivesContract?: string,
  data?: string
}

export type SignedStrategyData = {
  hash: string
  account: string
  signer: string
  chainId: BigInt
  signatureType: SignatureType
  signature: string
  strategy: StrategyJSON,
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
