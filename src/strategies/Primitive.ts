import { PrimitiveData, PrimitiveFunctionName, ContractCallParams } from './StrategyTypes'
import evm from './StrategiesEVM'

class Primitive {
  functionName!: PrimitiveFunctionName
  params!: ContractCallParams

  constructor(primitiveData: PrimitiveData) {
    this.fromJSON(primitiveData)
  }

  fromJSON (primitiveData: PrimitiveData) {
    this.functionName = primitiveData.functionName
    this.params = primitiveData.params
  }

  async toJSON (): Promise<PrimitiveData> {
    const data = await evm.callPrimitive(this.functionName, ...this.params)
    return {
      data: data,
      functionName: this.functionName,
      params: this.params
    }
  }

}

export default Primitive
