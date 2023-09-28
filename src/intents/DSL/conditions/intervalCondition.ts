import { IntervalConditionArgs, SegmentArgs } from '@brinkninja/types'

const DEFAULT_MAX_INTERVALS = 0
const DEFAULT_START_BLOCK = 0

function intervalCondition ({
  id,
  interval,
  startBlock = DEFAULT_START_BLOCK,
  maxIntervals = DEFAULT_MAX_INTERVALS
}: IntervalConditionArgs): SegmentArgs[] {
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
