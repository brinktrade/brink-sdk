import Primitive from '../Primitive'
import { Token } from '../StrategyTypes'
import { validateAddress, validateBytes, validateUint } from '../../utils/SolidityValidation'

export default class MarketSwapExactInput extends Primitive {
  constructor (
    priceOracle: string,
    priceOracleParams: string,
    owner: string,
    tokenIn: Token,
    tokenOut: Token,
    tokenInAmount: BigInt,
    feePercent: BigInt,
    feeMin: BigInt
  ) {
    validateAddress(priceOracle)
    validateBytes(priceOracleParams)
    validateAddress(owner)
    validateUint(tokenInAmount)
    validateUint(feePercent, 24)
    validateUint(feeMin)
    super({
      functionName: 'marketSwapExactInput',
      params: [priceOracle, priceOracleParams, owner, tokenIn, tokenOut, tokenInAmount, feePercent, feeMin]
    })
  }
}
