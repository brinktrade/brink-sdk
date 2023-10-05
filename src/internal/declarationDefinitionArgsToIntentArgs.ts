import { DeclarationArgs, DeclarationDefinitionArgs, IntentArgs } from '@brinkninja/types'
import { intentDefinitionArgsToIntentArgs } from '.'

function declarationDefinitionArgsToIntetnArgs (declaration: DeclarationDefinitionArgs): DeclarationArgs {
  if (declaration.replay) {
    throw new Error(`Intent replay not implemented. Set replay for individual segments`)
  }

  if (declaration.expiryBlock) {
    throw new Error(`Intent expiryBlock not implemented. Set expiryBlock for individual segments`)
  }

  const intents: IntentArgs[] = declaration.intents.map(intentDefinitionArgsToIntentArgs)

  return { intents }
}

export default declarationDefinitionArgsToIntetnArgs
