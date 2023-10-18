import { TokenStandard } from "@brinkninja/types";
import Joi from "joi";
import { joi } from "../../internal/joiExtended";

// Object.keys returns keys and values that's why we're filtering out the values using isNaN
const tokenStandards = Object.keys(TokenStandard).filter(key => isNaN(Number(key)));

export const TokenArgsSchema = joi.alternatives().try(
  joi.ethereumAddress(),
  joi.object({
    address: joi.ethereumAddress().required(),
    standard: joi.string().valid(...tokenStandards).optional(),
    idsMerkleRoot: joi.string().optional(),
    id: joi.bigIntish().optional(),
    disallowFlagged: joi.boolean().optional(),
  })
);


export const replaySchema = joi.object({
  nonce: joi.bigIntish().min(1).required(),
  runs: joi.string().valid('ONCE', 'UNTIL_CANCELLED').required(),
});

export const intervalConditionSchema = joi.object({
  type: joi.string().valid('interval').required(),
  id: joi.bigIntish().required(),
  interval: joi.bigIntish().required(),
  startBlock: joi.bigIntish().optional(),
  maxIntervals: joi.bigIntish().optional(),
});

export const blockConditionSchema = joi.object({
  type: joi.string().valid('block').required(),
  blockNumber: joi.bigIntish().required(),
  state: joi.string().valid('MINED', 'NOT_MINED').required()
});

export const nonceConditionSchema = joi.object({
  type: joi.string().valid('nonce').required(),
  nonce: joi.bigIntish().min(1).required(),
  state: joi.string().valid('USED', 'NOT_USED').required(),
});

export const priceConditionSchema = joi.object({
  type: joi.string().valid('price').required(),
  price: joi.bigIntish().min(0).required(),
  operator: joi.string().valid('lt', 'gt').required(),
  tokenA: TokenArgsSchema.required(),
  tokenB: TokenArgsSchema.required(),
  twapInterval: joi.bigIntish().min(0).optional(),
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
  id: joi.bigIntish().required(),
  tokenIn: TokenArgsSchema.required(),
  tokenOut: TokenArgsSchema.required(),
  tokenInAmount: joi.bigIntish().min(0).required(),
  tokenOutAmount: joi.bigIntish().min(0).required(),
});

export const marketSwapActionSchema = joi.object({
  type: joi.string().valid('marketSwap').required(),
  owner: joi.ethereumAddress().required(),
  tokenIn: TokenArgsSchema.required(),
  tokenOut: TokenArgsSchema.required(),
  tokenInAmount: joi.bigIntish().min(0).required(),
  fee: joi.number().min(0).max(100).required(),
  twapInterval: joi.bigIntish().min(0).optional(),
  twapFeePool: joi.number().integer().valid(500, 3000, 10000).optional(),
});

const actionSchemas = {
  limitSwap: limitSwapActionSchema,
  marketSwap: marketSwapActionSchema,
};

export const intentSegmentSchema = joi.object({
  replay: replaySchema.optional(),
  expiryBlock: joi.bigIntish().optional(),
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
