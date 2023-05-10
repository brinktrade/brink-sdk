import Primitive from './Primitive'
import Token from '../Token'
import { Oracle } from '../../oracles'
import { OracleArgs, PrimitiveJSON } from '../../Types'

export type MarketSwapExactInputConstructorArgs = {
  oracle: OracleArgs,
  signer: string
  tokenIn: Token
  tokenOut: Token
  tokenInAmount: BigInt
  feePercent: BigInt
  feeMin: BigInt
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
    let oracleAddress: string
    let oracleParams: string
    if (oracle instanceof Oracle) {
      const { contractAddress, paramsEncoded } = oracle
      oracleAddress = contractAddress
      oracleParams = paramsEncoded
    } else {
      const { address, params } = oracle
      oracleAddress = address
      oracleParams = params
    }

    super({
      functionName: 'marketSwapExactInput',
      params: {
        priceOracle: oracleAddress,
        priceOracleParams: oracleParams,
        owner: signer,
        tokenIn,
        tokenOut,
        tokenInAmount,
        feePercent,
        feeMinTokenOut: feeMin
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
        signer: json.params.owner as string,
        tokenIn: new Token(json.params.tokenIn as string),
        tokenOut: new Token(json.params.tokenOut as string),
        tokenInAmount: BigInt(json.params.tokenInAmount as string),
        feePercent: BigInt(json.params.feePercent as string),
        feeMin: BigInt(json.params.feeMinTokenOut as string)
      }
    }
  }
}
