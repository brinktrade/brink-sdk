import { PrimitiveData, PrimitiveFunctionName, ContractCallParams, UseBitParams } from './types'
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
    console.log('call evm: ', this.functionName)
    const data = await evm.callPrimitive(this.functionName, ...this.params)
    console.log('got data: ', data)
    return {
      data: data,
      functionName: this.functionName,
      params: this.params
    }
  }

}

export default Primitive
