import { PrimitiveData, PrimitiveFunctionName, PrimitiveType, ContractCallParams } from './StrategyTypes'
import evm from './StrategiesEVM'

const primitiveRequiresUnsignedMap: { [key in PrimitiveFunctionName]: boolean } = {
  marketSwapExactInput: true,
  requireBlockNotMined: false,
  requireUint256LowerBound: false,
  useBit: false
}

const primitiveTypeMap: { [key in PrimitiveFunctionName]: PrimitiveType } = {
  marketSwapExactInput: 'swap',
  requireBlockNotMined: 'require',
  requireUint256LowerBound: 'require',
  useBit: 'require'
}

class Primitive {
  functionName!: PrimitiveFunctionName
  params!: ContractCallParams
  type!: PrimitiveType

  constructor(primitiveData: PrimitiveData) {
    this.fromJSON(primitiveData)
  }

  fromJSON (primitiveData: PrimitiveData) {
    this.functionName = primitiveData.functionName
    this.params = primitiveData.params
    this.type = primitiveTypeMap[this.functionName]
  }

  async toJSON (): Promise<PrimitiveData> {
    const data = await evm.primitiveData(this.functionName, ...this.params)
    return {
      data: data,
      functionName: this.functionName,
      params: this.params,
      requiresUnsignedCall: primitiveRequiresUnsignedMap[this.functionName]
    }
  }

}

export default Primitive
