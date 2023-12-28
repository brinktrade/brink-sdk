import {
  SegmentJSON,
  SegmentFunctionName,
  SegmentType,
  SegmentParamType,
  ContractCallParam,
  SegmentParamJSON
} from '@brinkninja/types'
import { verifyParams, EthereumJsVm as evm } from '../../internal'

export interface SegmentClassArgs {
  functionName: `${SegmentFunctionName}`
  type: SegmentType
  requiresUnsignedCall: boolean
  paramsJSON: Record<string, SegmentParamJSON>
  paramTypes: SegmentParamType[]
  paramValues: ContractCallParam[]
}

export default class Segment {
  functionName: `${SegmentFunctionName}`
  type: SegmentType
  requiresUnsignedCall: boolean
  paramsJSON: Record<string, SegmentParamJSON>
  paramTypes: SegmentParamType[]
  paramValues: ContractCallParam[]

  constructor(segmentArgs: SegmentClassArgs) {
    this.functionName = segmentArgs.functionName
    this.type = segmentArgs.type
    this.requiresUnsignedCall = segmentArgs.requiresUnsignedCall
    this.paramsJSON = segmentArgs.paramsJSON
    this.paramTypes = segmentArgs.paramTypes
    this.paramValues = segmentArgs.paramValues

    verifyParams({
      functionName: this.functionName,
      types: this.paramTypes,
      values: this.paramValues
    })
  }

  async toJSON (): Promise<SegmentJSON> {
    const data = await evm.segmentData(this.functionName, ...this.paramValues)
    return {
      data: data,
      functionName: this.functionName,
      params: this.paramsJSON,
      requiresUnsignedCall: this.requiresUnsignedCall
    }
  }
}
