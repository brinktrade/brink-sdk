import { Address, Bytes32, Bytes, Uint } from '../utils/SolidityTypes'

export type ContractCallParams = (
  boolean | Address | Bytes32 | Bytes | Token | Uint | BigInt | ContractCallParams
)[]

export enum TokenStandard {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
  ETH = 3
}

export type Token = {
  standard: TokenStandard,
  addr: Address,
  idsMerkleRoot: Bytes32,
  id: Uint,
  disallowFlagged: boolean
}

export type PrimitiveFunctionName = 
  'useBit' |
  'marketSwapExactInput'

export type PrimitiveData = {
  functionName: PrimitiveFunctionName,
  params: ContractCallParams,
  data?: string
}

export type OrderData = {
  primitives: PrimitiveData[],
  data?: string
}

export type StrategyData = {
  orders: OrderData[],
  beforeCalls?: any[],
  afterCalls?: any[],
  data?: string
  hash?: string
  account?: string
  signature?: string
}
