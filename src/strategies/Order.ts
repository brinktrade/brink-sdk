import { OrderJSON, ValidationResult, PrimitiveFunctionName } from './StrategyTypes'
import Primitive from './Primitive'
import createPrimitive from './Primitives/createPrimitive'
import { invalidResult, validResult } from './Validation'

class Order {

  primitives: Primitive[] = []
  index: number = 0

  public constructor ()
  public constructor (orderJSON: OrderJSON)
  public constructor (primitives: Primitive[], index: number)
  public constructor(...args: any[]) {
    let orderJSON: OrderJSON = { primitives: [], index: 0 }
    if (typeof args[0] === 'object') {
      orderJSON = args[0]
    } else if (Array.isArray(args[0])) {
      orderJSON.primitives = args[0]
      orderJSON.index = args[1]
    }

    this.primitives = orderJSON.primitives.map((primitiveData: { functionName: PrimitiveFunctionName, params: unknown[] }) => {
      return createPrimitive(primitiveData.functionName, primitiveData.params)
    })
    this.index = orderJSON.index
  }

  async toJSON (): Promise<OrderJSON> {
    const primitives = await Promise.all(
      this.primitives.map(async primitive => await primitive.toJSON())
    )
    return {
      primitives,
      index: this.index,
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
