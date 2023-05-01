import Config from '../Config'
import { StrategyJSON, ValidationResult } from './StrategyTypes'
import Order from './Order'
import evm from './StrategiesEVM'
import { invalidResult, validResult } from './Validation'

const { PRIMITIVES_01 } = Config

class Strategy {
  orders: Order[]
  beforeCalls: any[]
  afterCalls: any[]
  primitivesContract: string

  public constructor ()
  public constructor (json: StrategyJSON)
  public constructor (orders: Order[])
  public constructor (orders: Order[], beforeCalls: any[], afterCalls: any[])
  public constructor (orders: Order[], beforeCalls: any[], afterCalls: any[], primitivesContract: string)
  public constructor(...args: any[]) {
    let strategyJSON: StrategyJSON = {
      orders: [],
      beforeCalls: [],
      afterCalls: [],
      primitivesContract: PRIMITIVES_01,
    }

    if (args.length == 1 && typeof args[0] === 'object') {
      strategyJSON = args[0]
    } else if (args.length == 1 && Array.isArray(args[0])) {
      strategyJSON.orders = args[0]
    } else if (args.length == 3) {
      strategyJSON.orders = args[0]
      strategyJSON.beforeCalls = args[1]
      strategyJSON.afterCalls = args[2]
    } else if (args.length == 4) {
      strategyJSON.orders = args[0]
      strategyJSON.beforeCalls = args[1]
      strategyJSON.afterCalls = args[2]
      strategyJSON.primitivesContract = args[3]
    }

    this.orders = strategyJSON.orders.map(orderJSON => new Order(orderJSON))
    this.beforeCalls = strategyJSON.beforeCalls || [] as any[]
    this.afterCalls = strategyJSON.afterCalls || [] as any[]
    this.primitivesContract = strategyJSON.primitivesContract || PRIMITIVES_01
  }

  async toJSON (): Promise<StrategyJSON> {
    const orders = await Promise.all(
      this.orders.map(async (order, orderIndex) => ( 
        {
          ...await order.toJSON(),
          orderIndex,
        }
    )))

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
