import { Signature, ethers } from 'ethers'

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
  primitives: PrimitiveJSON[]
  data?: string
}

export type StrategyJSON = {
  orders: OrderJSON[]
  beforeCalls?: any[]
  afterCalls?: any[]
  primitivesContract?: string,
  data?: string
}

export type SignedStrategyArgs = {
  signer: string
  chainId: number
  signature: string
  strategy: StrategyJSON
  strategyContract?: string
  signatureType?: SignatureType
}

export type SignedStrategyJSON = {
  eip712Data: EIP712TypedData
  account: string
  chainId: number
  signer: string
  signatureType: SignatureType
  signature: string
  strategy: StrategyJSON
  strategyContract: string
}

export type EIP712TypedData = {
  types: Record<string, ParamType[]>
  domain: {
    name: string
    version: string
    chainId: number
    verifyingContract: string
  }
  value: Record<string, string>
  hash: string
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

export type TransactionData = {
  to: string,
  data: string,
  value: BigInt,
}

export type ParamType = {
  name: string
  type: string
  calldata?: boolean
}

