import { PrimitiveArgs } from '@brinkninja/types'
import { BlockConditionArgs } from '@brink-sdk'

function blockCondition ({
  state,
  blockNumber
}: BlockConditionArgs): PrimitiveArgs[] {
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
