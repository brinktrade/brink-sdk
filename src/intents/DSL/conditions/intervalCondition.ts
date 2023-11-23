import { IntervalConditionArgs, SegmentArgs } from '@brinkninja/types'

const DEFAULT_MAX_INTERVALS = 0
const DEFAULT_START_BLOCK = 0

function intervalCondition ({
  id,
  interval,
  startBlock,
  maxIntervals
}: IntervalConditionArgs): SegmentArgs[] { 
  if(!startBlock) startBlock = DEFAULT_START_BLOCK
  if(!maxIntervals) maxIntervals = DEFAULT_MAX_INTERVALS
  return [
    {
      functionName: 'blockInterval',
      params: {
        id,
        intervalMinSize: interval,
        initialStart: startBlock,
        maxIntervals
      }
    }
  ]
}

export default intervalCondition
