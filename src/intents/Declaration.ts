import Config from '../Config'
import { DeclarationArgs, DeclarationJSON, ValidationResult, TokenAmount, Bit, DeclarationDefinitionArgs, IntentDefinitionArgs } from '@brinkninja/types'
import Intent, { BitNoncePair } from './Intent'
import {
  EthereumJsVm as evm,
  invalidResult,
  validResult,
  groupAndSumTokenAmounts,
  declarationDefinitionArgsToIntentArgs
} from '../internal'
import DeclarationIntent from './Intent'
import { intentOrArraySchema } from './DSL/schema'
import { bitToNonce } from '..'

const { PRIMITIVES_01 } = Config

class Declaration {
  intents: DeclarationIntent[]
  beforeCalls: any[]
  afterCalls: any[]
  segmentsContract: string

  public constructor ()
  public constructor (args: DeclarationDefinitionArgs)
  public constructor (args: IntentDefinitionArgs)
  public constructor (args: IntentDefinitionArgs[])
  public constructor (args: DeclarationArgs)
  public constructor (...arr: any[]) {
    const inputArgs: (DeclarationArgs | DeclarationDefinitionArgs | IntentDefinitionArgs | IntentDefinitionArgs[]) = arr[0] || {}

    let declarationArgs: DeclarationArgs = { intents: [] }

    if ('intents' in inputArgs && 'actions' in inputArgs?.intents[0]) {
      inputArgs.intents.forEach(intentInput => {
        const { error } = intentOrArraySchema.validate(intentInput)
        if (error) {
          throw new Error(error.message)
        }
      });

      declarationArgs = declarationDefinitionArgsToIntentArgs(inputArgs as DeclarationDefinitionArgs);
    } else if ('intents' in inputArgs && 'segments' in (inputArgs.intents[0])) {
      declarationArgs = inputArgs as DeclarationArgs;
    } else if ('actions' in inputArgs) {
      const { error } = intentOrArraySchema.validate(inputArgs)
      if (error) {
        throw new Error(error.message)
      }

      declarationArgs = declarationDefinitionArgsToIntentArgs({ intents: [inputArgs as IntentDefinitionArgs] });
    } else if ( Array.isArray(inputArgs) && 'actions' in inputArgs[0]) {
      const { error } = intentOrArraySchema.validate(inputArgs)
      if (error) {
        throw new Error(error.message)
      }

      declarationArgs = declarationDefinitionArgsToIntentArgs({ intents: inputArgs as IntentDefinitionArgs[] });
    }

    this.intents = (declarationArgs?.intents).map(intentArgs => new Intent(intentArgs))
    this.beforeCalls = declarationArgs?.beforeCalls || []
    this.afterCalls = declarationArgs?.afterCalls || []
    this.segmentsContract = declarationArgs?.segmentsContract || PRIMITIVES_01
  }

  async toJSON (): Promise<DeclarationJSON> {
    const intents = await Promise.all(
      this.intents.map(async intent => await intent.toJSON())
    )

    return {
      data: await evm.DeclarationData(
        intents,
        this.beforeCalls,
        this.afterCalls
      ),
      segmentsContract: Config['PRIMITIVES_01'] as string,
      intents,
      beforeCalls: this.beforeCalls,
      afterCalls: this.afterCalls
    }
  }

  tokenInputs (): TokenAmount[] {
    const tokenInputs: TokenAmount[] = []
    this.intents.forEach(intent => {
      intent.tokenInputs().forEach(tokenInput => {
        tokenInputs.push({
          token: tokenInput.token,
          amount: tokenInput.amount
        })
      })
    })
    return groupAndSumTokenAmounts(tokenInputs)
  }

  bits (): Bit[] {
    const bits: Bit[] = []
    this.intents.forEach(intent => {
      intent.bits().forEach(bit => {
        if (!bits.find(existingBit => (     
          existingBit.index == bit.index &&
          existingBit.value == bit.value
        ))) {
          bits.push(bit)
        }
      })
    })
    return bits
  }

  bitNoncePairs (): BitNoncePair[] {
    const bitNoncePairs: BitNoncePair[] = []
    this.intents.forEach(intent => {
      intent.bitNoncePairs().forEach((pair) => {
        if(!bitNoncePairs.find(existingPair => existingPair.nonce === pair.nonce)) {
          bitNoncePairs.push(pair)
        }
      })
    })
    return bitNoncePairs
  }

  validate (): ValidationResult {
    if (this.intents.length == 0) {
      return invalidResult('ZERO_INTENTS')
    }
    
    for (let i = 0; i < this.intents.length; i++) {
      const intent = this.intents[i]
      const intentValidationResult = intent.validate()
      if (!intentValidationResult.valid) return intentValidationResult
    }

    return validResult()
  }
}



export default Declaration
