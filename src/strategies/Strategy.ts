import { StrategyData } from './types'
import Order from './Order'
import evm from './StrategiesEVM'

class Strategy {
  orders: Order[] = []
  beforeCalls: any[] = []
  afterCalls: any[] = []

  constructor(strategyData: StrategyData | undefined) {
    if (strategyData) {
      this.fromJSON(strategyData)
    }
  }

  fromJSON (strategyData: StrategyData) {
    this.orders = strategyData.orders.map(orderData => new Order(orderData))
  }

  async toJSON (): Promise<StrategyData> {
    return {
      orders: await Promise.all(
        this.orders.map(async order => await order.toJSON())
      ),
      beforeCalls: this.beforeCalls,
      afterCalls: this.afterCalls
    }
  }

}

export default Strategy
