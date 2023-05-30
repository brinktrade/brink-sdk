import {
  PrimitiveJSON,
  PrimitiveFunctionName,
  PrimitiveType,
  PrimitiveParamType,
  ContractCallParam,
  PrimitiveParamJSON
} from '@brinkninja/types'
import { verifyParams, EthereumJsVm as evm } from '../../internal'

export interface PrimitiveClassArgs {
  functionName: PrimitiveFunctionName
  type: PrimitiveType
  requiresUnsignedCall: boolean
  paramsJSON: Record<string, PrimitiveParamJSON>
  paramTypes: PrimitiveParamType[]
  paramValues: ContractCallParam[]
}

export default class Primitive {
  functionName: PrimitiveFunctionName
  type: PrimitiveType
  requiresUnsignedCall: boolean
  paramsJSON: Record<string, PrimitiveParamJSON>
  paramTypes: PrimitiveParamType[]
  paramValues: ContractCallParam[]

  constructor(primitiveArgs: PrimitiveClassArgs) {
    this.functionName = primitiveArgs.functionName
    this.type = primitiveArgs.type
    this.requiresUnsignedCall = primitiveArgs.requiresUnsignedCall
    this.paramsJSON = primitiveArgs.paramsJSON
    this.paramTypes = primitiveArgs.paramTypes
    this.paramValues = primitiveArgs.paramValues

    verifyParams({
      functionName: this.functionName,
      types: this.paramTypes,
      values: this.paramValues
    })
  }

  async toJSON (): Promise<PrimitiveJSON> {
    const data = await evm.primitiveData(this.functionName, ...this.paramValues)
    return {
      data: data,
      functionName: this.functionName,
      params: this.paramsJSON,
      requiresUnsignedCall: this.requiresUnsignedCall
    }
  }
}
