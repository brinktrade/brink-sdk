import { uniqWith, isEqual } from 'lodash'
import Config from '../Config'
import {
  DeclarationArgs,
  DeclarationJSON,
  ValidationResult,
  TokenAmount,
  Bit,
  DeclarationDefinitionArgs,
  IntentDefinitionArgs,
  TokenJSON
} from '@brinkninja/types'
import Intent from './Intent'
import {
  EthereumJsVm as evm,
  invalidResult,
  validResult,
  groupAndSumTokenAmounts,
  declarationDefinitionArgsToIntentArgs
} from '../internal'
import DeclarationIntent from './Intent'
import { validateDeclarationInput } from './DSL/schema'

export interface DeclarationNonce {
  bit: Bit
  nonce: BigInt
  intentIndex: Number
  segmentIndex: Number
}

export type DeclarationToken = {
  token: TokenJSON
  segmentIndex: Number
  intentIndex: Number
  tokenParam: string
  isInput: boolean
  amount?: string
}

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

    let declarationArgs: DeclarationArgs = { intents: [],
      segmentsContract: '' }

    if ('intents' in inputArgs && 'actions' in inputArgs?.intents[0]) {
      if (!('chainId' in inputArgs)) {
        throw new Error('chainId must be provided')
      }
      const chainId = inputArgs.chainId
      const { error, value } = validateDeclarationInput(inputArgs, { chainId })
      if (error) {
        throw new Error(error.message)
      }

      declarationArgs.intents = declarationDefinitionArgsToIntentArgs(value as DeclarationDefinitionArgs);
      declarationArgs.segmentsContract = Config['SEGMENTS_01']
    } else if ('intents' in inputArgs && 'segments' in (inputArgs.intents[0])) {
      declarationArgs = inputArgs as DeclarationArgs;
    } else if ('actions' in inputArgs) {
      if (!('chainId' in inputArgs)) {
        throw new Error('chainId must be provided')
      }
      const chainId = inputArgs.chainId
      if (!chainId) {
        throw new Error('chainId must be provided')
      }

      const { error, value } = validateDeclarationInput(inputArgs, { chainId })
      if (error) {
        throw new Error(error.message)
      }

      declarationArgs.intents = declarationDefinitionArgsToIntentArgs({ chainId, intents: [value as IntentDefinitionArgs] });
      declarationArgs.segmentsContract = Config['SEGMENTS_01']
    }

    this.intents = (declarationArgs?.intents).map(intentArgs => new Intent(intentArgs))
    this.beforeCalls = declarationArgs?.beforeCalls || []
    this.afterCalls = declarationArgs?.afterCalls || []
    this.segmentsContract = declarationArgs?.segmentsContract
  }

  async toJSON ({ excludeData } = { excludeData: false }): Promise<DeclarationJSON> {
    if (!this.segmentsContract) {
      throw new Error('Segments contract address not set')
    }

    const intents = await Promise.all(
      this.intents.map(async intent => await intent.toJSON({ excludeData }))
    )

    const declarationJSON: DeclarationJSON = {
      segmentsContract: this.segmentsContract,
      intents,
      beforeCalls: this.beforeCalls,
      afterCalls: this.afterCalls
    };

    if (!excludeData) {
      declarationJSON.data = await evm.DeclarationData(
        intents,
        this.segmentsContract,
        this.beforeCalls,
        this.afterCalls
      )
    }

    return declarationJSON
  }

  async tokens (): Promise<DeclarationToken[]> {
    const tokens: DeclarationToken[] = []
    for (const [i, intent] of this.intents.entries()) {
      (await intent.tokens()).forEach(token => {
        tokens.push({
          ...token,
          intentIndex: i
        })
      })
    }
    return tokens
  }

  async tokenInputs (): Promise<TokenAmount[]> {
    const tokenInputs: TokenAmount[] = []
    for (const [, intent] of this.intents.entries()) {
      (await intent.tokenInputs()).forEach(tokenInput => {
        tokenInputs.push({
          token: tokenInput.token,
          amount: tokenInput.amount
        })
      })
    }
    return groupAndSumTokenAmounts(tokenInputs)
  }

  bits (): Bit[] {
    return uniqWith(this.nonces().map(n => n.bit), isEqual)
  }

  nonces (): DeclarationNonce[] {
    const nonces: DeclarationNonce[] = []
    this.intents.forEach((intent, i) => {
      intent.nonces().forEach((intentNonce) => {
        nonces.push({
          ...intentNonce,
          intentIndex: i  
        })
      })
    })
    return nonces
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
