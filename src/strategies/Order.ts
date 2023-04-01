import { OrderData } from './types'
import Primitive from './Primitive'
import evm from './StrategiesEVM'

class Order {

  primitives: Primitive[] = []

  constructor(orderData: OrderData | undefined) {
    if (orderData) {
      this.fromJSON(orderData)
    }
  }

  fromJSON (orderData: OrderData) {
    this.primitives = orderData.primitives.map(primitiveData => new Primitive(primitiveData))
  }

  async toJSON (): Promise<OrderData> {
    return {
      primitives: await Promise.all(
        this.primitives.map(async primitive => await primitive.toJSON())
      )
    }
  }

}

export default Order
