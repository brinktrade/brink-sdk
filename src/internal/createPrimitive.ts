import Segment from '../strategies/Primitives/Primitive'
import MarketSwapExactInput from '../strategies/Primitives/MarketSwapExactInput'
import RequireBitUsed from '../strategies/Primitives/RequireBitUsed'
import RequireBitNotUsed from '../strategies/Primitives/RequireBitNotUsed'
import RequireBlockMined from '../strategies/Primitives/RequireBlockMined'
import RequireBlockNotMined from '../strategies/Primitives/RequireBlockNotMined'
import RequireUint256LowerBound from '../strategies/Primitives/RequireUint256LowerBound'
import RequireUint256UpperBound from '../strategies/Primitives/RequireUint256UpperBound'
import BlockInterval from '../strategies/Primitives/BlockInterval'
import UseBit from '../strategies/Primitives/UseBit'
import { SegmentParamValue, SegmentFunctionName } from '@brinkninja/types'
import LimitSwapExactInput from '../strategies/Primitives/LimitSwapExactInput'

type SegmentMapping = {
  [key in SegmentFunctionName]: typeof Segment
}

function createMappingObject(mapping: Record<string, Function>): SegmentMapping {
  return Object.entries(mapping).reduce((acc, [key, value]) => {
    acc[key as keyof SegmentMapping] = value as any
    return acc
  }, {} as SegmentMapping)
}

const segmentMapping: SegmentMapping = createMappingObject({
  limitSwapExactInput: LimitSwapExactInput,
  marketSwapExactInput: MarketSwapExactInput,
  requireBitUsed: RequireBitUsed,
  requireBitNotUsed: RequireBitNotUsed,
  requireBlockMined: RequireBlockMined,
  requireBlockNotMined: RequireBlockNotMined,
  requireUint256LowerBound: RequireUint256LowerBound,
  requireUint256UpperBound: RequireUint256UpperBound,
  blockInterval: BlockInterval,
  useBit: UseBit
})

export interface CreateSegmentrArgs {
  functionName: SegmentFunctionName,
  params: Record<string, SegmentParamValue>
}

export default function createSegment({
  functionName, params
}: CreateSegmentrArgs): Segment {
  const SegmentClass = segmentMapping[functionName]
  if (!SegmentClass) {
    throw new Error(`Unknown segment: ${functionName}`)
  }
  return new (SegmentClass as any)(params)
}
