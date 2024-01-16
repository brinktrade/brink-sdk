import { segmentFunctionNames, signatureTypes, tokenStandards } from "./constants";
import { joi } from "./joiExtended";

const SignatureTypeEnumSchema = joi.string().valid(...signatureTypes);

const TokenStandardSchema = joi.string().valid(...tokenStandards);

const TokenSchema = joi.object({
  address: joi.ethereumAddress().required(),
  standard: TokenStandardSchema.optional(),
  idsMerkleRoot: joi.string().optional(),
  id: joi.string().optional(),
  disallowFlagged: joi.boolean().optional()
});

const SegmentFunctionNameSchema = joi.string().valid(...segmentFunctionNames);

const IdsProofStructSchema = joi.object({
  ids: joi.array().items(joi.string()).required(),
  merkleProof_hashes: joi.array().items(joi.string()).required(),
  merkleProof_flags: joi.array().items(joi.boolean()).required(),
  statusProof_lastTransferTimes: joi.array().items(joi.string()).required(),
  statusProof_timestamps: joi.array().items(joi.string()).required(),
  statusProof_signatures: joi.array().items(joi.string()).required()
});

const SegmentStructSchema = joi.object({
  data: joi.string().required(),
  requiresUnsignedCall: joi.boolean().required()
});

const CallStructSchema = joi.object({
  targetContract: joi.ethereumAddress().required(), // TODO: Check
  data: joi.string().required()
});

const FillStateParamsSchema = joi.object({
  id: joi.bigIntish().required(),
  startX96: joi.bigIntish().required(),
  sign: joi.boolean().required()  
});

const ContractCallParamSchema = joi.alternatives().try(
  joi.bigIntish(),
  joi.boolean(),
  joi.string(),
  SignatureTypeEnumSchema, 
  TokenSchema,
  IdsProofStructSchema,
  FillStateParamsSchema,
  SegmentStructSchema,
  CallStructSchema,
  // This is to avoid "Block-scoped variable 'ContractCallParamSchema' used before its declaration."
  joi.array().items(() => ContractCallParamSchema)
);

const OracleSchema = joi.object({
  address: joi.ethereumAddress().required(),
  params: joi.string().required()
});

const SwapAmountSchema = joi.object({
  contractAddress: joi.ethereumAddress().optional(),
  contractName: joi.string().valid('FixedSwapAmount01', 'BlockIntervalDutchAuctionAmount01').optional(),
  paramsBytesData: joi.string().optional(),
  params: joi.array().items(() => ContractCallParamSchema).optional(),
  paramTypes: joi.array().items(joi.object({
    name: joi.string().required(),
    type: joi.string().required(),
  })).optional()
})

const useBitParamsSchema = joi.object({
  index: joi.bigIntish().required(),
  value: joi.bigIntish().required()
});;

const requireBlockNotMinedParamsSchema = joi.object({
  blockNumber: joi.bigIntish().required()
});

const requireUint256LowerBoundParamsSchema = joi.object({
  oracle: OracleSchema.required(),
  lowerBound: joi.bigIntish().required()
});

const marketSwapExactInputParamsSchema = joi.object({
  oracle: OracleSchema.required(),
  signer: joi.ethereumAddress().required(),
  tokenIn: TokenSchema.required(),
  tokenOut: TokenSchema.required(),
  tokenInAmount: joi.bigIntish().required(),
  feePercent: joi.bigIntish().required(),
  feeMin: joi.bigIntish().required()
});

const blockIntervalParamsSchema = joi.object({
  id: joi.bigIntish().required(),
  initialStart: joi.bigIntish().required(),
  intervalMinSize: joi.bigIntish().required(),
  maxIntervals: joi.bigIntish().required()
});

const priceCurveSchema = joi.object({
  address: joi.ethereumAddress().required(),
  params: joi.string().required()
});

const limitSwapExactInputParamsSchema = joi.object({
  priceCurve: priceCurveSchema.required(),
  signer: joi.ethereumAddress().required(),
  tokenIn: TokenSchema.required(),
  tokenOut: TokenSchema.required(),
  tokenInAmount: joi.bigIntish().required(),
  fillStateParams: FillStateParamsSchema.required()
})

const requireBitNotUsedParamsSchema = joi.object({
  value: joi.bigIntish().required(),
  index: joi.bigIntish().required()
})
  
const requireBitUsedParamsSchema = joi.object({
  value: joi.bigIntish().required(),
  index: joi.bigIntish().required()
});

const requireBlockMinedParamsSchema = joi.object({
  blockNumber: joi.bigIntish().required()
});

const requireUint256UpperBoundParamsSchema = joi.object({
  oracle: OracleSchema.required(),
  upperBound: joi.bigIntish().required()
});

const swap01ParamsSchema = joi.object({
  signer: joi.ethereumAddress().required(),
  tokenIn: TokenSchema.required(),
  tokenOut: TokenSchema.required(),
  inputAmount: SwapAmountSchema.required(),
  outputAmount: SwapAmountSchema.required(),
  solverValidator: joi.string().required()
});

const SegmentArgsSchema = joi.object({
  functionName: SegmentFunctionNameSchema.required(),
  params: joi.alternatives().conditional('functionName', [
    { is: 'useBit', then: useBitParamsSchema },
    { is: 'requireBlockMined', then: requireBlockMinedParamsSchema },
    { is: 'requireBlockNotMined', then: requireBlockNotMinedParamsSchema },
    { is: 'requireUint256LowerBound', then: requireUint256LowerBoundParamsSchema },
    { is: 'requireUint256UpperBound', then: requireUint256UpperBoundParamsSchema },
    { is: 'marketSwapExactInput', then: marketSwapExactInputParamsSchema },
    { is: 'blockInterval', then: blockIntervalParamsSchema },
    { is: 'limitSwapExactInput', then: limitSwapExactInputParamsSchema },
    { is: 'requireBitNotUsed', then: requireBitNotUsedParamsSchema },
    { is: 'requireBitUsed', then: requireBitUsedParamsSchema },
    { is: 'swap01', then: swap01ParamsSchema },
  ]),
  data: joi.string(),
  requiresUnsignedCall: joi.boolean(),
});

const IntentArgsSchema = joi.object({
  segments: joi.array().items(SegmentArgsSchema).required()
});

export const FunctionalSchema = joi.object({
  intents: joi.array().items(IntentArgsSchema).required(),
  beforeCalls: joi.array().items(joi.any()),
  afterCalls: joi.array().items(joi.any()),
  segmentsContract: joi.ethereumAddress(),
  data: joi.string()
});
