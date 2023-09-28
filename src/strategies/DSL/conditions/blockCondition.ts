import { BlockConditionArgs, SegmentArgs } from '@brinkninja/types'

function blockCondition ({
  state,
  blockNumber
}: BlockConditionArgs): SegmentArgs[] {
  if (state == 'MINED') {
    return [{
      functionName: 'requireBlockMined',
      params: {
        blockNumber
      }
    }]
  } else if (state == 'NOT_MINED') {
    return [{
      functionName: 'requireBlockNotMined',
      params: {
        blockNumber
      }
    }]
  } else {
    throw new Error(`Invalid value '${state}' for blockCondition state`)
  }

}

export default blockCondition
