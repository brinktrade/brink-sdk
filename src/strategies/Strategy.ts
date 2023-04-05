import Config from '../Config'
import { StrategyData } from './StrategyTypes'
import Order from './Order'
import evm from './StrategiesEVM'

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

}

export default Strategy
