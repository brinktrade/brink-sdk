import {
  PrimitiveArgs,
  IntentSegmentArgs,
  OrderArgs,
  MarketSwapActionArgs,
  LimitSwapActionArgs,
  BlockConditionArgs,
  IntervalConditionArgs,
  NonceConditionArgs,
  PriceConditionArgs
} from '@brinkninja/types'
import { nonceToBit } from '../utils'
import dslConditions from '../strategies/DSL/conditions'
import dslActions from '../strategies/DSL/actions'

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

function intentSegmentArgsToOrderArgs (intentSegment: IntentSegmentArgs): OrderArgs {
  let orderArgs: OrderArgs = { primitives: [] }

  if (intentSegment.replay) {
    if (intentSegment.replay.runs == 'ONCE') {
     orderArgs.primitives.push({
      functionName: 'useBit',
      params: nonceToBit({ nonce: intentSegment.replay.nonce })
    })
    } else if (intentSegment.replay.runs == 'UNTIL_CANCELLED') {
      throw new Error('UNIL_CANCELLED not implemented')
      // TODO: add primitive types for requireBitNotUsed
      // orderArgs.primitives.push({
      //   functionName: 'requireBitNotUsed',
      //   params: nonceToBit({ nonce: intentSegment.replay.nonce })
      // })
    } else {
      throw new Error(`Invalid value for replay.runs: ${intentSegment.replay.runs}`)
    }
  }

  if (intentSegment.expiryBlock) {
    orderArgs.primitives.push({
      functionName: 'requireBlockNotMined',
      params: {
        blockNumber: BigInt(intentSegment.expiryBlock)
      }
    })
  }

  if (!intentSegment.conditions) intentSegment.conditions = []
  if (!intentSegment.actions) intentSegment.actions = []

  // add condition primitives to orderArgs
  const conditionPrimitives: PrimitiveArgs[] = intentSegment.conditions.reduce((primitives: PrimitiveArgs[], conditionArgs) => {
    const typeName: keyof ConditionFnTypeName = `${conditionArgs.type}Condition`
    const args = conditionArgs as ConditionFnTypeName[typeof typeName]
    primitives.push(...runPrimitiveArgsGeneratingFn<typeof args>(
      conditionArgs,
      dslConditions[`${conditionArgs.type}Condition`] as (a: typeof args) => PrimitiveArgs[]
    ))
    return primitives
  }, [])
  orderArgs.primitives.push(...conditionPrimitives)

  // add action primitives to orderArgs
  const actionPrimitives: PrimitiveArgs[] = intentSegment.actions.reduce((primitives: PrimitiveArgs[], actionArgs) => {
    const typeName: keyof ActionFnTypeName = `${actionArgs.type}Action`
    const args = actionArgs as ActionFnTypeName[typeof typeName]
    primitives.push(...runPrimitiveArgsGeneratingFn<typeof args>(
      actionArgs,
      dslActions[`${actionArgs.type}Action`] as (a: typeof args) => PrimitiveArgs[]
    ))
    return primitives
  }, [])
  orderArgs.primitives.push(...actionPrimitives)

  return orderArgs
}

function runPrimitiveArgsGeneratingFn<T>(args: T, fn: (args: T) => PrimitiveArgs[]): PrimitiveArgs[] {
  return fn(args)
}

export default intentSegmentArgsToOrderArgs
