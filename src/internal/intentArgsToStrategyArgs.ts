import { StrategyArgs, IntentArgs, OrderArgs } from '@brinkninja/types'
import { intentSegmentArgsToOrderArgs } from '.'

function intentArgsToStrategyArgs (intent: IntentArgs): StrategyArgs {
  if (intent.replay) {
    throw new Error(`Intent replay not implemented. Set replay for individual segments`)
  }

  if (intent.expiryBlock) {
    throw new Error(`Intent expiryBlock not implemented. Set expiryBlock for individual segments`)
  }

  const orders: OrderArgs[] = intent.segments.map(intentSegmentArgsToOrderArgs)

  return { orders }
}

export default intentArgsToStrategyArgs
