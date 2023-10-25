import { BlockState, NonceState, PriceOperator, RunsType, TokenStandard } from "@brinkninja/types";
import Joi from "joi";
import { joi } from "../../internal/joiExtended";

const tokenStandards = Object.keys(TokenStandard).filter(key => isNaN(Number(key)));

const tokenArgs = {
  address: joi.ethereumAddress().required(),
  standard: joi.string().valid(...tokenStandards).optional(),
  idsMerkleRoot: joi.string().optional(),
  id: joi.bigIntish().optional(),
  disallowFlagged: joi.boolean().optional(),
}

export const TokenSchema = joi.alternatives().try(
  joi.ethereumAddress(),
  joi.object(tokenArgs)
);

const tokenWithDecimalsArgs = {
  ...tokenArgs,
  decimals: joi.uint().required()
}

const runsTypes = Object.keys(RunsType).filter(key => isNaN(Number(key)));

export const replaySchema = joi.object({
  nonce: joi.bigIntish().min(1).required(),
  runs: joi.string().valid(...runsTypes).required(),
});

export const intervalConditionSchema = joi.object({
  type: joi.string().valid('interval').required(),
  id: joi.uint(64).required(),
  interval: joi.uint(128).required(),
  startBlock: joi.uint(128).optional(),
  maxIntervals: joi.uint(16).optional(),
});

const blockStates = Object.keys(BlockState).filter(key => isNaN(Number(key)));

export const blockConditionSchema = joi.object({
  type: joi.string().valid('block').required(),
  blockNumber: joi.uint().required(),
  state: joi.string().valid(...blockStates).required()
});

const nonceStates = Object.keys(NonceState).filter(key => isNaN(Number(key)));

export const nonceConditionSchema = joi.object({
  type: joi.string().valid('nonce').required(),
  nonce: joi.bigIntish().min(1).required(),
  state: joi.string().valid(...nonceStates).required(),
});

const priceOperators = Object.values(PriceOperator)

export const priceConditionSchema = joi.object({
  type: joi.string().valid('price').required(),
  price: joi.uint().required(),
  operator: joi.string().valid(...priceOperators).required(),
  tokenA: joi.object(tokenWithDecimalsArgs).required(),
  tokenB: joi.object(tokenWithDecimalsArgs).required(),
  twapInterval: joi.uint(32).optional(),
  twapFeePool: joi.number().integer().valid(500, 3000, 10000).optional(),
});

const conditionSchemas = {
  interval: intervalConditionSchema,
  block: blockConditionSchema,
  nonce: nonceConditionSchema,
  price: priceConditionSchema,
};

export const limitSwapActionSchema = joi.object({
  type: joi.string().valid('limitSwap').required(),
  id: joi.uint(64).required(),
  tokenIn: TokenSchema.required(),
  tokenOut: TokenSchema.required(),
  tokenInAmount: joi.uint().required(),
  tokenOutAmount: joi.uint().required(),
  owner: joi.ethereumAddress().required(),
});

export const marketSwapActionSchema = joi.object({
  type: joi.string().valid('marketSwap').required(),
  owner: joi.ethereumAddress().required(),
  tokenIn: TokenSchema.required(),
  tokenOut: TokenSchema.required(),
  tokenInAmount: joi.uint().required(),
  fee: joi.number().min(0).max(100).required(),
  twapInterval: joi.uint(32).optional(),
  twapFeePool: joi.number().integer().valid(500, 3000, 10000).optional(),
});

const actionSchemas = {
  limitSwap: limitSwapActionSchema,
  marketSwap: marketSwapActionSchema,
};

export const intentSegmentSchema = joi.object({
  replay: replaySchema.optional(),
  expiryBlock: joi.uint().optional(),
  conditions: joi.array().items(generateConditional(conditionSchemas)).optional(),
  actions: joi.array().items(generateConditional(actionSchemas)).required(),
});

export const intentOrArraySchema = joi.alternatives().try(
  intentSegmentSchema,
  joi.array().items(intentSegmentSchema)
);


type SchemaMap = {
  [type: string]: Joi.ObjectSchema;
};

function generateConditional(schemaMap: SchemaMap) {
  return joi.alternatives().conditional('.type', {
    switch: Object.entries(schemaMap).map(([type, schema]) => ({
      is: type,
      then: schema,
    }))
  });
}
