import { Bytes } from '../utils/SolidityTypes'
import { OrderData } from './StrategyTypes'
import Primitive from './Primitive'
import createPrimitive from './Primitives/createPrimitive'
import evm from './StrategiesEVM'

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
    const primitives = await Promise.all(
      this.primitives.map(async primitive => await primitive.toJSON())
    )
    const data = await evm.orderData(...primitives.map(primitive => {
      return [primitive.data, primitive.requiresUnsignedCall] as [Bytes, boolean]
    }))
    return {
      data,
      primitives
    }
  }

}

export default Order
