import { toTokenArgs, toTokenWithDecimalsArgs, toBigint } from "../../internal";
import { BlockState, NonceState, PriceOperator, RunsType, TokenStandard } from "@brinkninja/types"
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

const tokenWithDecimalsArgs = {
  ...tokenArgs,
  decimals: joi.uint().required()
}

export const TokenSchema = joi.alternatives().try(
  joi.string(),
  joi.object(tokenArgs)
);

export const TokenWithDecimalsSchema = joi.alternatives().try(
  joi.string(),
  joi.object(tokenWithDecimalsArgs)
);

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

const toTokenWithDecimals = (value: any, helpers: any) => {
  const chainId = helpers.prefs.context.chainId;

  const ret = toTokenWithDecimalsArgs(value, chainId);
    
  return ret
};

const toToken = (value: any, helpers: any) => {
  const chainId = helpers.prefs.context.chainId;

  const ret = toTokenArgs(value, chainId);

  return ret
};

export const toTokenWithDecimalsSchema = TokenWithDecimalsSchema.custom(toTokenWithDecimals, 'toTokenArgsWithDecimals');
export const toTokenSchema = TokenSchema.custom(toToken, 'toTokenArgsWithDecimals');

export const priceConditionSchema = joi.object({
  type: joi.string().valid('price').required(),
  price: joi.number().required(),
  operator: joi.string().valid(...priceOperators).required(),
  tokenA: toTokenWithDecimalsSchema.required(),
  tokenB: toTokenWithDecimalsSchema.required(),
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
  tokenIn: toTokenSchema.required(),
  tokenOut: toTokenSchema.required(),
  tokenInAmount: joi.uint().required(),
  tokenOutAmount: joi.uint().required(),
  owner: joi.ethereumAddress().required(),
});

export const marketSwapActionSchema = joi.object({
  type: joi.string().valid('marketSwap').required(),
  owner: joi.ethereumAddress().required(),
  tokenIn: toTokenSchema.required(),
  tokenOut: toTokenSchema.required(),
  tokenInAmount: joi.uint().required(),
  fee: joi.number().min(0).max(100).required(),
  twapInterval: joi.uint(32).optional(),
  twapFeePool: joi.number().integer().valid(500, 3000, 10000).optional(),
});

const actionSchemas = {
  limitSwap: limitSwapActionSchema,
  marketSwap: marketSwapActionSchema,
};

const chainIdSchema = joi.number().integer() // .valid(1);

export const singleIntentSchema = joi.object({
  replay: replaySchema.optional(),
  expiryBlock: joi.uint().optional(),
  conditions: joi.array().items(generateConditional(conditionSchemas)).optional(),
  actions: joi.array().items(generateConditional(actionSchemas)).required(),
  chainId: chainIdSchema.optional(),
})

export const multiIntentSchema = joi.object({
  chainId: chainIdSchema.required(),
  intents: joi.array().items(singleIntentSchema).required(),
})

export const intentOrArraySchema = joi.alternatives().try(
  singleIntentSchema,
  multiIntentSchema
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
