import Primitive from '../Primitive'
import MarketSwapExactInput from './MarketSwapExactInput'
import RequireBlockNotMined from './RequireBlockNotMined'
import RequireUint256LowerBound from './RequireUint256LowerBound'
import UseBit from './UseBit'
import { PrimitiveFunctionName } from '../../Types'

type PrimitiveMapping = {
  [key in PrimitiveFunctionName]: typeof Primitive
}

function createMappingObject(mapping: Record<string, Function>): PrimitiveMapping {
  return Object.entries(mapping).reduce((acc, [key, value]) => {
    acc[key as keyof PrimitiveMapping] = value as any
    return acc
  }, {} as PrimitiveMapping)
}

const primitiveMapping: PrimitiveMapping = createMappingObject({
  marketSwapExactInput: MarketSwapExactInput,
  requireBlockNotMined: RequireBlockNotMined,
  requireUint256LowerBound: RequireUint256LowerBound,
  useBit: UseBit
})

export default function createPrimitive<T extends keyof PrimitiveMapping>(
  functionName: PrimitiveFunctionName,
  params: unknown[]
): InstanceType<PrimitiveMapping[T]> {
  const PrimitiveClass = primitiveMapping[functionName]
  if (!PrimitiveClass) {
    throw new Error(`Unknown primitive: ${functionName}`)
  }
  return new (PrimitiveClass as any)(...params) as InstanceType<PrimitiveMapping[T]>
}
