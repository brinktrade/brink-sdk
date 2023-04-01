import Primitive from '../Primitive'
import { Address, Bytes, Uint } from '../../utils/SolidityTypes'
import { Token } from '../StrategyTypes'
import { validateAddress, validateBytes, validateUint } from '../../utils/SolidityValidation'

export default class MarketSwapExactInput extends Primitive {
  constructor (
    priceOracle: Address,
    priceOracleParams: Bytes,
    owner: Address,
    tokenIn: Token,
    tokenOut: Token,
    tokenInAmount: Uint,
    feePercent: Uint,
    feeMin: Uint
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
