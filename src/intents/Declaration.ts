import Config from '../Config'
import { DeclarationArgs, DeclarationJSON, ValidationResult, TokenAmount, Bit, IntentArgs, IntentSegmentArgs } from '@brinkninja/types'
import Intent from './DeclarationIntent'
import {
  EthereumJsVm as evm,
  invalidResult,
  validResult,
  groupAndSumTokenAmounts,
  intentArgsToDeclarationArgs
} from '../internal'
import DeclarationIntent from './DeclarationIntent'

const { PRIMITIVES_01 } = Config

class Declaration {
  intents: DeclarationIntent[]
  beforeCalls: any[]
  afterCalls: any[]
  segmentsContract: string

  public constructor ()
  public constructor (args: IntentArgs)
  public constructor (args: IntentSegmentArgs)
  public constructor (args: IntentSegmentArgs[])
  public constructor (args: DeclarationArgs)
  public constructor (...arr: any[]) {
    const inputArgs: (DeclarationArgs | IntentArgs | IntentSegmentArgs | IntentSegmentArgs[]) = arr[0] || {}

    let declarationArgs: DeclarationArgs
    if ((inputArgs as IntentArgs).segments) {
      declarationArgs = intentArgsToDeclarationArgs(inputArgs as IntentArgs)
    } else if ((inputArgs as IntentSegmentArgs).actions) {
      declarationArgs = intentArgsToDeclarationArgs({ segments: [inputArgs as IntentSegmentArgs] })
    } else if ((inputArgs as IntentSegmentArgs[]).length > 0 && (inputArgs as IntentSegmentArgs[])[0].actions) {
      declarationArgs = intentArgsToDeclarationArgs({ segments: inputArgs as IntentSegmentArgs[] })
    } else {
      declarationArgs = inputArgs as DeclarationArgs
    }

    this.intents = (declarationArgs?.intents || []).map(intentArgs => new Intent(intentArgs))
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
