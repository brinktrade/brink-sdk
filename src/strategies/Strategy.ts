import Config from '../Config'
import { StrategyData, ValidationResult, InvalidReason, invalidReasonMessages } from './StrategyTypes'
import Order from './Order'
import evm from './StrategiesEVM'
import { invalidResult, validResult } from './Validation'

class Strategy {
  orders: Order[] = []
  beforeCalls: any[] = []
  afterCalls: any[] = []

  constructor(
    strategyData: StrategyData | undefined) {
    if (strategyData) {
      this.fromJSON(strategyData)
    }
  }

  fromJSON (strategyData: StrategyData) {
    this.orders = strategyData.orders.map(orderData => new Order(orderData))
  }

  async toJSON (): Promise<StrategyData> {
    const orders = await Promise.all(
      this.orders.map(async order => await order.toJSON())
    )

    return {
      data: await evm.strategyData(
        orders,
        this.beforeCalls,
        this.afterCalls
      ),
      primitivesContract: Config.get('PRIMITIVES_CONTRACT') as string,
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
