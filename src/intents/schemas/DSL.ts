import { toTokenArgs, toTokenWithDecimalsArgs, toBigint } from "../../internal";
import { DeclarationDefinitionArgs, IntentDefinitionArgs } from "@brinkninja/types"
import { blockStates, nonceStates, priceOperators, runsTypes, tokenStandards } from './constants'
import Joi from "joi";
import { joi } from "./joiExtended";

const emptyValues = [null, 'null', '%00', '\u0000']; 

const tokenArgs = {
  address: joi.ethereumAddress().required(),
  standard: joi.string().valid(...tokenStandards).empty(emptyValues),
  idsMerkleRoot: joi.string().empty(emptyValues),
  id: joi.bigIntish().empty(emptyValues),
  disallowFlagged: joi.boolean().empty(emptyValues),
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

export const replaySchema = joi.object({
  nonce: joi.bigIntish().min(1).required(),
  runs: joi.string().valid(...runsTypes).required(),
});

export const intervalConditionSchema = joi.object({
  type: joi.string().valid('interval').required(),
  id: joi.uint(64).required(),
  interval: joi.uint(128).required(),
  startBlock: joi.uint(128).empty(emptyValues),
  maxIntervals: joi.uint(16).empty(emptyValues),
});

export const blockConditionSchema = joi.object({
  type: joi.string().valid('block').required(),
  blockNumber: joi.uint().required(),
  state: joi.string().valid(...blockStates).required()
});

export const nonceConditionSchema = joi.object({
  type: joi.string().valid('nonce').required(),
  nonce: joi.bigIntish().min(1).required(),
  state: joi.string().valid(...nonceStates).required(),
});

const toTokenWithDecimals = (value: any, helpers: any) => {
  const chainId = helpers.prefs.context.chainId;
  if (!chainId) {
    throw new Error('ChainId not found in context');
  }


  const ret = toTokenWithDecimalsArgs(value, chainId);
    
  return ret
};

const toToken = (value: any, helpers: any) => {
  const chainId = helpers.prefs.context.chainId;
  if (!chainId) {
    throw new Error('ChainId not found in context');
  }

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
  twapInterval: joi.uint(32).empty(emptyValues),
  twapFeePool: joi.number().integer().valid(500, 3000, 10000).empty(emptyValues),
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
  twapInterval: joi.uint(32).empty(emptyValues),
  twapFeePool: joi.number().integer().valid(500, 3000, 10000).empty(emptyValues),
});

export const blockIntervalDutchAuctionSwapSchema = joi.object({
  type: joi.string().valid('blockIntervalDutchAuctionSwap').required(),
  owner: joi.ethereumAddress().required(),
  tokenIn: toTokenSchema.required(),
  tokenOut: toTokenSchema.required(),
  tokenInAmount: joi.uint().required(),
  intervalId: joi.uint(64).required(),
  firstAuctionStartBlock: joi.uint().required(),
  auctionInterval: joi.uint().required(),
  auctionDuration: joi.uint().required(),
  startPercent: joi.number().min(0).max(100).required(),
  endPercent: joi.number().max(0).required(),
  maxAuctions: joi.uint().empty(emptyValues),
  twapInterval: joi.uint(32).empty(emptyValues),
  twapFeePool: joi.number().integer().valid(500, 3000, 10000).empty(emptyValues),
})

const actionSchemas = {
  limitSwap: limitSwapActionSchema,
  marketSwap: marketSwapActionSchema,
  blockIntervalDutchAuctionSwap: blockIntervalDutchAuctionSwapSchema
};

const chainIdSchema = joi.number().integer() // .valid(1);

export const singleIntentDSLSchema = joi.object({
  replay: replaySchema.optional(),
  expiryBlock: joi.uint().empty(emptyValues).optional(),
  conditions: joi.array().items(generateConditional(conditionSchemas)).empty(emptyValues).optional(),
  actions: joi.array().items(generateConditional(actionSchemas)).required(),
  chainId: chainIdSchema.optional(),
})

export const multiIntentDSLSchema = joi.object({
  chainId: chainIdSchema.required(),
  intents: joi.array().items(singleIntentDSLSchema).required(),
})

export const intentOrArraySchema = joi.alternatives().try(
  singleIntentDSLSchema,
  multiIntentDSLSchema
);

export const validateDeclarationInput = (
  inputArgs: DeclarationDefinitionArgs | IntentDefinitionArgs,
  context: any
) => {
  if ((inputArgs as IntentDefinitionArgs).actions) {
    return singleIntentDSLSchema.validate(inputArgs, { context })
  } else if ((inputArgs as DeclarationDefinitionArgs).intents) {
    return multiIntentDSLSchema.validate(inputArgs, { context })
  } else {
    return { error: { message: 'Invalid intent declaration'} }
  }
}

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
