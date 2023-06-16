import { OrderArgs, OrderJSON, ValidationResult, PrimitiveFunctionName, PrimitiveParamValue, PrimitiveJSON, TokenAmount, Bit } from '@brinkninja/types'
import Primitive from './Primitives/Primitive'
import InputTokenPrimitive from './Primitives/InputTokenPrimitive'
import { createPrimitive, invalidResult, validResult, groupAndSumTokenAmounts } from '../internal'

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

  tokenInputs (): TokenAmount[] {
    const tokenInputs: TokenAmount[] = []
    this.primitives.forEach(primitive => {
      if (primitive instanceof InputTokenPrimitive) {
        tokenInputs.push({
          token: primitive.inputToken,
          amount: primitive.inputAmount
        })
      }
    })
    return groupAndSumTokenAmounts(tokenInputs)
  }

  bits (): Bit[] {
    const bits: Bit[] = []
    this.primitives.forEach(primitive => {
      if (primitiveHasBitData(primitive)) {
        const bit: Bit = {
          bitmapIndex: BigInt(primitive.paramsJSON.bitmapIndex.toString()),
          bit: BigInt(primitive.paramsJSON.bit.toString())
        }
        if(!bits.find(existingBit => (     
          existingBit.bitmapIndex == bit.bitmapIndex &&
          existingBit.bit == bit.bit
        ))) {
          bits.push(bit)
        }
      }
    })
    return bits
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

const primitiveHasBitData = (primitive: Primitive): boolean => (
  primitive.paramsJSON.hasOwnProperty('bitmapIndex') && primitive.paramsJSON.hasOwnProperty('bit')
)

export default Order
