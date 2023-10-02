import { DeclarationArgs, IntentArgs, DeclarationIntentArgs } from '@brinkninja/types'
import { intentSegmentArgsToDeclarationIntentArgs } from '.'

function intentArgsToIntetnGroupArgs (intent: IntentArgs): DeclarationArgs {
  if (intent.replay) {
    throw new Error(`Intent replay not implemented. Set replay for individual segments`)
  }

  if (intent.expiryBlock) {
    throw new Error(`Intent expiryBlock not implemented. Set expiryBlock for individual segments`)
  }

  const intents: DeclarationIntentArgs[] = intent.segments.map(intentSegmentArgsToDeclarationIntentArgs)

  return { intents }
}

export default intentArgsToIntetnGroupArgs
