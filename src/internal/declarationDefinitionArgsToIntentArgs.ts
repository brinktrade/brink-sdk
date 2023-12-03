import { DeclarationDefinitionArgs, IntentArgs } from '@brinkninja/types'
import { intentDefinitionArgsToIntentArgs } from '.'

function declarationDefinitionArgsToIntentArgs (declaration: DeclarationDefinitionArgs): IntentArgs[] {
  if (declaration.replay) {
    throw new Error(`Intent replay not implemented. Set replay for individual segments`)
  }

  if (declaration.expiryBlock) {
    throw new Error(`Intent expiryBlock not implemented. Set expiryBlock for individual segments`)
  }

  return declaration.intents.map(intentDefinitionArgsToIntentArgs)
}

export default declarationDefinitionArgsToIntentArgs
