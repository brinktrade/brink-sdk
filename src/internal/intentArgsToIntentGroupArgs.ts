import { IntentGroupArgs, IntentArgs, IntentGroupIntentArgs } from '@brinkninja/types'
import { intentSegmentArgsToIntentGroupIntentArgs } from '.'

function intentArgsToIntetnGroupArgs (intent: IntentArgs): IntentGroupArgs {
  if (intent.replay) {
    throw new Error(`Intent replay not implemented. Set replay for individual segments`)
  }

  if (intent.expiryBlock) {
    throw new Error(`Intent expiryBlock not implemented. Set expiryBlock for individual segments`)
  }

  const intents: IntentGroupIntentArgs[] = intent.segments.map(intentSegmentArgsToIntentGroupIntentArgs)

  return { intents }
}

export default intentArgsToIntetnGroupArgs
