import { joi } from "../../internal/joiExtended";

export const TokenArgsSchema = joi.alternatives().try(
  joi.ethereumAddress(),
  joi.object({
    address: joi.ethereumAddress().required(),
    standard: joi.string().valid('ERC20', 'ERC721', 'ERC1155', 'ETH').optional(),
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

export const intentSegmentSchema = joi.object({
  replay: replaySchema.optional(),
  expiryBlock: joi.bigIntish().optional(),
  conditions: joi.array().items(
    joi.alternatives().conditional('.type', {
      switch: [{
        is: 'interval',
        then: intervalConditionSchema,
      }, {
          is: 'block',
          then: blockConditionSchema,
        }, {
          is: 'nonce',
          then: nonceConditionSchema,
        }, {
          is: 'price',
          then: priceConditionSchema,
        }]
    })
  ).optional(),
  actions: joi.array().items(
    joi.alternatives().conditional('.type', {
      switch: [{
        is: 'limitSwap',
        then: limitSwapActionSchema,
      }, {
        is: 'marketSwap',
        then: marketSwapActionSchema,
      }]
    })
  ).required(),
});

export const intentOrArraySchema = joi.alternatives().try(
  intentSegmentSchema,
  joi.array().items(intentSegmentSchema)
);

