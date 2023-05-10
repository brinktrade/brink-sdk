import { OrderJSON, ValidationResult, PrimitiveFunctionName, PrimitiveParamValue } from '../Types'
import Primitive from './Primitives/Primitive'
import createPrimitive from './Primitives/createPrimitive'
import { invalidResult, validResult } from './Validation'

class Order {

  primitives: Primitive[] = []

  public constructor ()
  public constructor (orderJSON: OrderJSON)
  public constructor (primitives: Primitive[])
  public constructor(...args: any[]) {
    let orderJSON: OrderJSON = { primitives: [] }
    if (typeof args[0] === 'object') {
      orderJSON = args[0]
    } else if (Array.isArray(args[0])) {
      orderJSON.primitives = args[0]
    }

    this.primitives = orderJSON.primitives.map((primitiveData: {
      functionName: PrimitiveFunctionName,
      params: Record<string, PrimitiveParamValue>
    }) => {
      return createPrimitive(primitiveData.functionName, primitiveData.params)
    })
  }

  async toJSON (): Promise<OrderJSON> {
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
