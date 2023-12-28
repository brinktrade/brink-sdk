import { BlockState,  NonceState, PriceOperator, RunsType, SegmentFunctionName, SignatureType, TokenStandard } from "@brinkninja/types"

// if value in the array is a stringified number, it should convert to a number
export const tokenStandards = Object.keys(TokenStandard).map(key => isNaN(Number(key)) ? key : Number(key))
export const runsTypes = Object.keys(RunsType).filter(key => isNaN(Number(key)));
export const blockStates = Object.keys(BlockState).filter(key => isNaN(Number(key)));
export const nonceStates = Object.keys(NonceState).filter(key => isNaN(Number(key)));
export const priceOperators = Object.values(PriceOperator)
export const signatureTypes = Object.keys(SignatureType).filter(key => isNaN(Number(key)));
export const segmentFunctionNames = Object.keys(SegmentFunctionName).filter(key => isNaN(Number(key)));

