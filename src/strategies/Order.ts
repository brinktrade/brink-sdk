import { OrderArgs, OrderJSON, ValidationResult, PrimitiveFunctionName, PrimitiveParamValue, PrimitiveJSON } from '@brinkninja/types'
import Primitive from './Primitives/Primitive'
import createPrimitive from '../internal/createPrimitive'
import { invalidResult, validResult } from '../internal/Validation'

export type OrderConstructorArgs = {
  primitives: PrimitiveJSON[]
}

class Order {

  primitives: Primitive[] = []

  public constructor ()
  public constructor (args: OrderArgs)
  public constructor (...arr: any[]) {
    const args: OrderArgs = arr[0] || {}
    let orderArgs: OrderArgs = {
      primitives: args?.primitives || []
    }

    this.primitives = orderArgs.primitives.map((primitiveData: {
      functionName: PrimitiveFunctionName,
      params: Record<string, PrimitiveParamValue>
    }) => {
      return createPrimitive(primitiveData)
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
