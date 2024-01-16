import { DeclarationArgs, DeclarationDefinitionArgs, IntentDefinitionArgs } from "@brinkninja/types"
import { multiIntentDSLSchema, singleIntentDSLSchema } from "./DSL"
import { FunctionalSchema } from "./functional"

export const validateDeclarationInput = (
  inputArgs: DeclarationDefinitionArgs | IntentDefinitionArgs | DeclarationArgs,
  context?: any
) => {
  if ((inputArgs as IntentDefinitionArgs).actions) {
    return singleIntentDSLSchema.validate(inputArgs, { context })
  } else if ('intents' in inputArgs && 'segments' in (inputArgs.intents[0])) {
    return  FunctionalSchema.validate(inputArgs)
  } else if ((inputArgs as DeclarationDefinitionArgs).intents) {
    return multiIntentDSLSchema.validate(inputArgs, { context })
  } else {
    return { error: { message: 'Invalid intent declaration'} }
  }
}
