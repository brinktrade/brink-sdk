import { BigIntish, PrimitiveParamType } from '@brinkninja/types'
import Primitive from './Primitive'

export type BlockIntervalArgs = {
  id: BigIntish,
  initialStart: BigIntish,
  intervalMinSize: BigIntish,
  maxIntervals: BigIntish
}

export const BlockIntervalFunctionParams: PrimitiveParamType[] = [
  {
    name: 'id',
    type: 'uint64',
    signed: true
  },
  {
    name: 'initialStart',
    type: 'uint128',
    signed: true
  },
  {
    name: 'intervalMinSize',
    type: 'uint128',
    signed: true
  },
  {
    name: 'maxIntervals',
    type: 'uint16',
    signed: true
  }
]

export default class BlockInterval extends Primitive {
  public constructor ({
    id,
    initialStart,
    intervalMinSize,
    maxIntervals
  }: BlockIntervalArgs) {
    super({
      functionName: 'blockInterval',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        id: id?.toString(),
        initialStart: initialStart?.toString(),
        intervalMinSize: intervalMinSize?.toString(),
        maxIntervals: maxIntervals?.toString()
      },
      paramTypes: BlockIntervalFunctionParams,
      paramValues: [
        id?.toString(),
        initialStart?.toString(),
        intervalMinSize?.toString(),
        maxIntervals?.toString()
      ]
    })
  }
}