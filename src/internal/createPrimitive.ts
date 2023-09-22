import Primitive from '../strategies/Primitives/Primitive'
import MarketSwapExactInput from '../strategies/Primitives/MarketSwapExactInput'
import RequireBitUsed from '../strategies/Primitives/RequireBitUsed'
import RequireBitNotUsed from '../strategies/Primitives/RequireBitNotUsed'
import RequireBlockMined from '../strategies/Primitives/RequireBlockMined'
import RequireBlockNotMined from '../strategies/Primitives/RequireBlockNotMined'
import RequireUint256LowerBound from '../strategies/Primitives/RequireUint256LowerBound'
import RequireUint256UpperBound from '../strategies/Primitives/RequireUint256UpperBound'
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
  requireBitUsed: RequireBitUsed,
  requireBitNotUsed: RequireBitNotUsed,
  requireBlockMined: RequireBlockMined,
  requireBlockNotMined: RequireBlockNotMined,
  requireUint256LowerBound: RequireUint256LowerBound,
  requireUint256UpperBound: RequireUint256UpperBound,
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
