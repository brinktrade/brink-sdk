import {
  SegmentArgs,
  IntentDefinitionArgs,
  IntentArgs,
  MarketSwapActionArgs,
  LimitSwapActionArgs,
  BlockConditionArgs,
  IntervalConditionArgs,
  NonceConditionArgs,
  PriceConditionArgs
} from '@brinkninja/types'
import { nonceToBit } from '../utils'
import dslConditions from '../intents/DSL/conditions'
import dslActions from '../intents/DSL/actions'

type ActionFnTypeName = {
  marketSwapAction: MarketSwapActionArgs
  limitSwapAction: LimitSwapActionArgs
}

type ConditionFnTypeName = {
  blockCondition: BlockConditionArgs
  intervalCondition: IntervalConditionArgs
  nonceCondition: NonceConditionArgs
  priceCondition: PriceConditionArgs
}

function IntentDefinitionArgsToIntentArgs (intentSegment: IntentDefinitionArgs): IntentArgs {
  let intentArgs: IntentArgs = { segments: [] }

  if (intentSegment.replay) {
    if (intentSegment.replay.runs == 'ONCE') {
     intentArgs.segments.push({
      functionName: 'useBit',
      params: nonceToBit({ nonce: intentSegment.replay.nonce })
    })
    } else if (intentSegment.replay.runs == 'UNTIL_CANCELLED') {
      throw new Error('UNIL_CANCELLED not implemented')
      // TODO: add segment types for requireBitNotUsed
      // intentArgs.segments.push({
      //   functionName: 'requireBitNotUsed',
      //   params: nonceToBit({ nonce: intentSegment.replay.nonce })
      // })
    } else {
      throw new Error(`Invalid value for replay.runs: ${intentSegment.replay.runs}`)
    }
  }

  if (intentSegment.expiryBlock) {
    intentArgs.segments.push({
      functionName: 'requireBlockNotMined',
      params: {
        blockNumber: BigInt(intentSegment.expiryBlock)
      }
    })
  }

  if (!intentSegment.conditions) intentSegment.conditions = []
  if (!intentSegment.actions) intentSegment.actions = []

  // add condition segments to intentArgs
  const conditionSegments: SegmentArgs[] = intentSegment.conditions.reduce((segments: SegmentArgs[], conditionArgs) => {
    const typeName: keyof ConditionFnTypeName = `${conditionArgs.type}Condition`
    const args = conditionArgs as ConditionFnTypeName[typeof typeName]
    segments.push(...runSegmentArgsGeneratingFn<typeof args>(
      conditionArgs,
      dslConditions[`${conditionArgs.type}Condition`] as (a: typeof args) => SegmentArgs[]
    ))
    return segments
  }, [])
  intentArgs.segments.push(...conditionSegments)

  // add action segments to intentArgs
  const actionSegments: SegmentArgs[] = intentSegment.actions.reduce((segments: SegmentArgs[], actionArgs) => {
    const typeName: keyof ActionFnTypeName = `${actionArgs.type}Action`
    const args = actionArgs as ActionFnTypeName[typeof typeName]
    segments.push(...runSegmentArgsGeneratingFn<typeof args>(
      actionArgs,
      dslActions[`${actionArgs.type}Action`] as (a: typeof args) => SegmentArgs[]
    ))
    return segments
  }, [])
  intentArgs.segments.push(...actionSegments)

  return intentArgs
}

function runSegmentArgsGeneratingFn<T>(args: T, fn: (args: T) => SegmentArgs[]): SegmentArgs[] {
  return fn(args)
}

export default IntentDefinitionArgsToIntentArgs
