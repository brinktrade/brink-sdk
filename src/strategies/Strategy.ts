import Config from '../Config'
import { StrategyArgs, StrategyJSON, ValidationResult, TokenAmount, Bit, IntentArgs, IntentSegmentArgs } from '@brinkninja/types'
import Order from './Order'
import {
  EthereumJsVm as evm,
  invalidResult,
  validResult,
  groupAndSumTokenAmounts,
  intentArgsToStrategyArgs
} from '../internal'

const { PRIMITIVES_01 } = Config

class Strategy {
  orders: Order[]
  beforeCalls: any[]
  afterCalls: any[]
  primitivesContract: string

  public constructor ()
  public constructor (args: IntentArgs)
  public constructor (args: IntentSegmentArgs)
  public constructor (args: IntentSegmentArgs[])
  public constructor (args: StrategyArgs)
  public constructor (...arr: any[]) {
    const inputArgs: (StrategyArgs | IntentArgs | IntentSegmentArgs | IntentSegmentArgs[]) = arr[0] || {}

    let strategyArgs: StrategyArgs
    if ((inputArgs as IntentArgs).segments) {
      strategyArgs = intentArgsToStrategyArgs(inputArgs as IntentArgs)
    } else if ((inputArgs as IntentSegmentArgs).actions) {
      strategyArgs = intentArgsToStrategyArgs({ segments: [inputArgs as IntentSegmentArgs] })
    } else if ((inputArgs as IntentSegmentArgs[]).length > 0 && (inputArgs as IntentSegmentArgs[])[0].actions) {
      strategyArgs = intentArgsToStrategyArgs({ segments: inputArgs as IntentSegmentArgs[] })
    } else {
      strategyArgs = inputArgs as StrategyArgs
    }

    this.orders = (strategyArgs?.orders || []).map(orderArgs => new Order(orderArgs))
    this.beforeCalls = strategyArgs?.beforeCalls || []
    this.afterCalls = strategyArgs?.afterCalls || []
    this.primitivesContract = strategyArgs?.primitivesContract || PRIMITIVES_01
  }

  async toJSON (): Promise<StrategyJSON> {
    const orders = await Promise.all(
      this.orders.map(async order => await order.toJSON())
    )

    return {
      data: await evm.strategyData(
        orders,
        this.beforeCalls,
        this.afterCalls
      ),
      primitivesContract: Config['PRIMITIVES_01'] as string,
      orders,
      beforeCalls: this.beforeCalls,
      afterCalls: this.afterCalls
    }
  }

  tokenInputs (): TokenAmount[] {
    const tokenInputs: TokenAmount[] = []
    this.orders.forEach(order => {
      order.tokenInputs().forEach(tokenInput => {
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
    this.orders.forEach(order => {
      order.bits().forEach(bit => {
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
    if (this.orders.length == 0) {
      return invalidResult('ZERO_ORDERS')
    }
    
    for (let i = 0; i < this.orders.length; i++) {
      const order = this.orders[i]
      const orderValidationResult = order.validate()
      if (!orderValidationResult.valid) return orderValidationResult
    }

    return validResult()
  }
}



export default Strategy
