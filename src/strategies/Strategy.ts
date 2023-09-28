import Config from '../Config'
import { IntentGroupArgs, IntentGroupJSON, ValidationResult, TokenAmount, Bit, IntentArgs, IntentSegmentArgs } from '@brinkninja/types'
import Intent from './Order'
import {
  EthereumJsVm as evm,
  invalidResult,
  validResult,
  groupAndSumTokenAmounts,
  intentArgsToIntentGroupArgs
} from '../internal'
import IntentGroupIntent from './Order'

const { PRIMITIVES_01 } = Config

class IntentGroup {
  intents: IntentGroupIntent[]
  beforeCalls: any[]
  afterCalls: any[]
  segmentsContract: string

  public constructor ()
  public constructor (args: IntentArgs)
  public constructor (args: IntentSegmentArgs)
  public constructor (args: IntentSegmentArgs[])
  public constructor (args: IntentGroupArgs)
  public constructor (...arr: any[]) {
    const inputArgs: (IntentGroupArgs | IntentArgs | IntentSegmentArgs | IntentSegmentArgs[]) = arr[0] || {}

    let intentGroupArgs: IntentGroupArgs
    if ((inputArgs as IntentArgs).segments) {
      intentGroupArgs = intentArgsToIntentGroupArgs(inputArgs as IntentArgs)
    } else if ((inputArgs as IntentSegmentArgs).actions) {
      intentGroupArgs = intentArgsToIntentGroupArgs({ segments: [inputArgs as IntentSegmentArgs] })
    } else if ((inputArgs as IntentSegmentArgs[]).length > 0 && (inputArgs as IntentSegmentArgs[])[0].actions) {
      intentGroupArgs = intentArgsToIntentGroupArgs({ segments: inputArgs as IntentSegmentArgs[] })
    } else {
      intentGroupArgs = inputArgs as IntentGroupArgs
    }

    this.intents = (intentGroupArgs?.intents || []).map(intentArgs => new Intent(intentArgs))
    this.beforeCalls = intentGroupArgs?.beforeCalls || []
    this.afterCalls = intentGroupArgs?.afterCalls || []
    this.segmentsContract = intentGroupArgs?.segmentsContract || PRIMITIVES_01
  }

  async toJSON (): Promise<IntentGroupJSON> {
    const intents = await Promise.all(
      this.intents.map(async intent => await intent.toJSON())
    )

    return {
      data: await evm.IntentGroupData(
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



export default IntentGroup
