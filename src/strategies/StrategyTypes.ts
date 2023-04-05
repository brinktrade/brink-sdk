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
  data?: string
}

export type SignedStrategyData = {
  hash: string
  account: string
  signer: string
  chainId: BigInt
  signatureType: SignatureType
  signature: string
  strategy: StrategyData
}

export type PrimitiveStruct = {
  data: string
  requiresUnsignedCall: boolean
}

export type CallStruct = {
  targetContract: string
  data: string
}
