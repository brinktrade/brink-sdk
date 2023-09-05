import Primitive from '../strategies/Primitives/Primitive'
import MarketSwapExactInput from '../strategies/Primitives/MarketSwapExactInput'
import RequireBlockNotMined from '../strategies/Primitives/RequireBlockNotMined'
import RequireUint256LowerBound from '../strategies/Primitives/RequireUint256LowerBound'
import BlockInterval from '../strategies/Primitives/BlockInterval'
import UseBit from '../strategies/Primitives/UseBit'
import { PrimitiveParamValue, PrimitiveFunctionName } from '@brinkninja/types'
import LimitSwapExactInput from '../strategies/Primitives/LimitSwapExactInput'

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
  limitSwapExactInput: LimitSwapExactInput,
  marketSwapExactInput: MarketSwapExactInput,
  requireBlockNotMined: RequireBlockNotMined,
  requireUint256LowerBound: RequireUint256LowerBound,
  blockInterval: BlockInterval,
  useBit: UseBit
})

export interface CreatePrimitiverArgs {
  functionName: PrimitiveFunctionName,
  params: Record<string, PrimitiveParamValue>
}

export default function createPrimitive({
  functionName, params
}: CreatePrimitiverArgs): Primitive {
  const PrimitiveClass = primitiveMapping[functionName]
  if (!PrimitiveClass) {
    throw new Error(`Unknown primitive: ${functionName}`)
  }
  return new (PrimitiveClass as any)(params)
}
