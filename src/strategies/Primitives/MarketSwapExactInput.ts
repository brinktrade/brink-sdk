import Primitive from './Primitive'
import Token, { TokenArgs } from '../Token'
import { OracleJSON, PrimitiveJSON, BigIntish } from '@brinkninja/types'

export type MarketSwapExactInputConstructorArgs = {
  oracle: OracleJSON,
  signer: string
  tokenIn: Token
  tokenOut: Token
  tokenInAmount: BigIntish
  feePercent: BigIntish
  feeMin: BigIntish
}

export default class MarketSwapExactInput extends Primitive {
  public constructor ({
    oracle,
    signer,
    tokenIn,
    tokenOut,
    tokenInAmount,
    feePercent,
    feeMin
  }: MarketSwapExactInputConstructorArgs) {
    super({
      functionName: 'marketSwapExactInput',
      params: {
        priceOracle: oracle.address,
        priceOracleParams: oracle.params,
        owner: signer,
        tokenIn,
        tokenOut,
        tokenInAmount: BigInt(tokenInAmount),
        feePercent: BigInt(feePercent),
        feeMinTokenOut: BigInt(feeMin)
      }
    })
  }

  async toJSON(): Promise<PrimitiveJSON> {
    const json = await super.toJSON()
    return {
      ...json,
      params: {
        oracle: {
          address: json.params.priceOracle as string,
          params: json.params.priceOracleParams as string
        },
        signer: json.params.owner,
        tokenIn: new Token(json.params.tokenIn as TokenArgs),
        tokenOut: new Token(json.params.tokenOut as TokenArgs),
        tokenInAmount: BigInt(json.params.tokenInAmount as string),
        feePercent: BigInt(json.params.feePercent as string),
        feeMin: BigInt(json.params.feeMinTokenOut as string)
      }
    }
  }
}
