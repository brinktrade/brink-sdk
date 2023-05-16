import { find, filter } from 'lodash'
import Token from '../Token'
import {
  PrimitiveJSON,
  PrimitiveFunctionName,
  PrimitiveType,
  PrimitiveParamValue,
  PrimitiveParamType,
  ContractCallParam
} from '@brinkninja/types'
import {
  MarketSwapExactInputFunctionParams,
  RequireBlockNotMinedFunctionParams,
  RequireUint256LowerBoundFunctionParams,
  UseBitFunctionParams
} from './PrimitiveFunctionParams'
import evm from '../../internal/EthereumJsVm'
import { validateAddress, validateBytes, validateUint } from '../../internal/SolidityValidation'

type PrimitiveMetadata = {
  requiresUnsignedCall: boolean
  type: 'swap' | 'require'
  paramTypes: PrimitiveParamType[]
}

const primitiveMetadataMap: { [key in PrimitiveFunctionName]: PrimitiveMetadata } = {
  marketSwapExactInput: {
    requiresUnsignedCall: true,
    type: 'swap',
    paramTypes: MarketSwapExactInputFunctionParams
  },
  requireBlockNotMined: {
    requiresUnsignedCall: false,
    type: 'require',
    paramTypes: RequireBlockNotMinedFunctionParams
  },
  requireUint256LowerBound: {
    requiresUnsignedCall: true,
    type: 'require',
    paramTypes: RequireUint256LowerBoundFunctionParams
  },
  useBit: {
    requiresUnsignedCall: true,
    type: 'require',
    paramTypes: UseBitFunctionParams
  }
}

class Primitive {
  functionName: PrimitiveFunctionName
  params: Record<string, PrimitiveParamValue>
  type: PrimitiveType
  requiresUnsignedCall: boolean
  paramTypes: PrimitiveParamType[]
  paramValues: ContractCallParam[]

  constructor(primitiveJSON: PrimitiveJSON) {
    this.functionName = primitiveJSON.functionName
    this.params = primitiveJSON.params
    this.type = primitiveMetadataMap[this.functionName].type
    this.requiresUnsignedCall = primitiveMetadataMap[this.functionName].requiresUnsignedCall
    this.paramTypes = filter(primitiveMetadataMap[this.functionName].paramTypes, { signed: true })
    for (let paramName in this.params) {
      if (!find(this.paramTypes, { name: paramName })) {
        throw new Error(`Unknown param '${paramName}' for primitive ${this.functionName}`)
      }
    }

    this.paramValues = []
    for (let i in this.paramTypes) {
      const { name, type } = this.paramTypes[i]
      let paramVal: ContractCallParam = this.params[name] as ContractCallParam
      if (typeof paramVal == 'undefined') {
        throw new Error(`Missing param '${name}' for primitive ${this.functionName}`)
      }

      if (type === 'address') {
        validateAddress(name, paramVal as string)
      } else if (type === 'bytes') {
        validateBytes(name, paramVal as string)
      } else if (type.slice(4) === 'uint') {
        validateUint(name, BigInt(paramVal.toString()), parseInt(type.slice(4)))
      }

      if (typeof paramVal === 'bigint') {
        paramVal = paramVal.toString()
      } else if (paramVal instanceof Token) {
        paramVal = paramVal.toStruct()
      }

      this.paramValues.push(paramVal as ContractCallParam)
    }
  }

  async toJSON (): Promise<PrimitiveJSON> {
    const data = await evm.primitiveData(this.functionName, ...this.paramValues)
    return {
      data: data,
      functionName: this.functionName,
      params: Object.entries(this.params).reduce<Record<string, PrimitiveParamValue>>(
        (acc, [paramName, paramVal]) => {
          let v = paramVal
          if (typeof paramVal === 'bigint') {
            v = paramVal.toString()
          } else if (paramVal instanceof Token) {
            v = paramVal.toJSON()
          }
          acc[paramName] = v
          return acc
        },
        {}
      ),
      requiresUnsignedCall: this.requiresUnsignedCall
    }
  }

}

export default Primitive
