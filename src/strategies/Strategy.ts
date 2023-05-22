import Config from '../Config'
import { StrategyArgs, StrategyJSON, ValidationResult } from '@brinkninja/types'
import Order from './Order'
import evm from '../internal/EthereumJsVm'
import { invalidResult, validResult } from '../internal/Validation'

const { PRIMITIVES_01 } = Config

class Strategy {
  orders: Order[]
  beforeCalls: any[]
  afterCalls: any[]
  primitivesContract: string

  public constructor ()
  public constructor (args: StrategyArgs)
  public constructor (...arr: any[]) {
    const args: StrategyArgs = arr[0] || {}
    this.orders = (args?.orders || []).map(orderArgs => new Order(orderArgs))
    this.beforeCalls = args?.beforeCalls || []
    this.afterCalls = args?.afterCalls || []
    this.primitivesContract = args?.primitivesContract || PRIMITIVES_01
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
