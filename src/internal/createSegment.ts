import Segment from '../intents/Segments/Segment'
import MarketSwapExactInput from '../intents/Segments/MarketSwapExactInput'
import RequireBitUsed from '../intents/Segments/RequireBitUsed'
import RequireBitNotUsed from '../intents/Segments/RequireBitNotUsed'
import RequireBlockMined from '../intents/Segments/RequireBlockMined'
import RequireBlockNotMined from '../intents/Segments/RequireBlockNotMined'
import RequireUint256LowerBound from '../intents/Segments/RequireUint256LowerBound'
import RequireUint256UpperBound from '../intents/Segments/RequireUint256UpperBound'
import BlockInterval from '../intents/Segments/BlockInterval'
import UseBit from '../intents/Segments/UseBit'
import { SegmentParamValue, SegmentFunctionName } from '@brinkninja/types'
import LimitSwapExactInput from '../intents/Segments/LimitSwapExactInput'

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
