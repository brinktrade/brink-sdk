import Primitive from '../Primitive'
import Token from '../Token'
import Oracle from '../Oracles/Oracle'
import { validateAddress, validateBytes, validateUint } from '../../utils/SolidityValidation'

export default class MarketSwapExactInput extends Primitive {

  public constructor (
    priceOracle: string,
    priceOracleParams: string,
    owner: string,
    tokenIn: Token,
    tokenOut: Token,
    tokenInAmount: BigInt,
    feePercent: BigInt,
    feeMin: BigInt
  );

  public constructor (
    priceOracle: Oracle,
    owner: string,
    tokenIn: Token,
    tokenOut: Token,
    tokenInAmount: BigInt,
    feePercent: BigInt,
    feeMin: BigInt
  )

  public constructor (...args: any[]) {
    let priceOracle, priceOracleParams, owner, tokenIn, tokenOut, tokenInAmount, feePercent, feeMin
    if (args[0] instanceof Oracle) {
      priceOracle = args[0].contractAddress
      priceOracleParams = args[0].paramsEncoded
      owner = args[1]
      tokenIn = args[2]
      tokenOut = args[3]
      tokenInAmount = args[4]
      feePercent = args[5]
      feeMin = args[6]
    } else {
      priceOracle = args[0]
      priceOracleParams = args[1]
      owner = args[2]
      tokenIn = args[3]
      tokenOut = args[4]
      tokenInAmount = args[5]
      feePercent = args[6]
      feeMin = args[7]
    }

    validateAddress('priceOracle', priceOracle)
    validateBytes('priceOracleParams', priceOracleParams)
    validateAddress('owner', owner)
    validateUint('tokenInAmount', tokenInAmount)
    validateUint('feePercent', feePercent, 24)
    validateUint('feeMin', feeMin)

    super({
      functionName: 'marketSwapExactInput',
      params: [priceOracle, priceOracleParams, owner, tokenIn, tokenOut, tokenInAmount, feePercent, feeMin]
    })
  }
}
