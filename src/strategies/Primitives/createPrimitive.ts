import UseBit from './UseBit'
import MarketSwapExactInput from './MarketSwapExactInput'
import { PrimitiveFunctionName } from '../StrategyTypes'

type PrimitiveMapping = {
  useBit: typeof UseBit
  marketSwapExactInput: typeof MarketSwapExactInput
}

function createMappingObject(mapping: Record<string, Function>): PrimitiveMapping {
  return Object.entries(mapping).reduce((acc, [key, value]) => {
    acc[key as keyof PrimitiveMapping] = value as any
    return acc
  }, {} as PrimitiveMapping)
}

const primitiveMapping: PrimitiveMapping = createMappingObject({
  useBit: UseBit,
  marketSwapExactInput: MarketSwapExactInput,
})

export default function createPrimitive<T extends keyof PrimitiveMapping>(
  functionName: PrimitiveFunctionName,
  params: unknown[]
): InstanceType<PrimitiveMapping[T]> {
  const PrimitiveClass = primitiveMapping[functionName]
  return new (PrimitiveClass as any)(...params) as InstanceType<PrimitiveMapping[T]>
}
