import { OrderData } from './StrategyTypes'
import Primitive from './Primitive'
import createPrimitive from './Primitives/createPrimitive'

class Order {

  primitives: Primitive[] = []

  constructor(orderData: OrderData | undefined) {
    if (orderData) {
      this.fromJSON(orderData)
    }
  }

  fromJSON (orderData: OrderData) {
    this.primitives = orderData.primitives.map(primitiveData => {
      return createPrimitive(primitiveData.functionName, primitiveData.params)
    })
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
