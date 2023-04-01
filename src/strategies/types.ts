export type PrimitiveFunctionName = 
  'useBit' |
  'marketSwapExactInput'

export type ContractCallParams = (string | number | ContractCallParams)[]

export type PrimitiveFunctionParams = {
  [key:string]: UseBitParams
}

export type UseBitParams = {
  bitmapIndex: number,
  bit: number
}

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
