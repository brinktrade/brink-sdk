import Token from './Token'
import { PrimitiveJSON, PrimitiveFunctionName, PrimitiveType, ContractCallParams } from './StrategyTypes'
import evm from '../internal/EthereumJsVm'

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
  functionName: PrimitiveFunctionName
  params: ContractCallParams
  type: PrimitiveType

  constructor(primitiveJSON: PrimitiveJSON) {
    this.functionName = primitiveJSON.functionName
    this.params = primitiveJSON.params
    this.type = primitiveTypeMap[this.functionName]
  }

  async toJSON (): Promise<PrimitiveJSON> {
    const data = await evm.primitiveData(this.functionName, ...this.params)
    return {
      data: data,
      functionName: this.functionName,
      params: this.params.map(param => {
        if (typeof param === 'bigint') {
          return param.toString()
        } else if (param instanceof Token) {
          return param.toJSON()
        } else {
          return param
        }
      }),
      requiresUnsignedCall: primitiveRequiresUnsignedMap[this.functionName]
    }
  }

}

export default Primitive
