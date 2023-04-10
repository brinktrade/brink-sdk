import { OrderData, ValidationResult } from './StrategyTypes'
import Primitive from './Primitive'
import createPrimitive from './Primitives/createPrimitive'
import { invalidResult, validResult } from './Validation'

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
    return {
      primitives
    }
  }

  validate (): ValidationResult {
    if (this.primitives.length == 0) return { valid: false }
    
    let numSwaps = 0
    for (let i = 0; i < this.primitives.length; i++) {
      if (this.primitives[i].type == 'swap') numSwaps++
    }
    if (numSwaps !== 1) return invalidResult('WRONG_NUMBER_OF_SWAPS')

    return validResult()
  }

}

export default Order
