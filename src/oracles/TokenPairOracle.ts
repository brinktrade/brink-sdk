import { Token } from '../strategies'
import { CallData, TokenArgs } from '@brinkninja/types'
import Uint256Oracle from './Uint256Oracle'

export type TokenPairOracleConstructorArgs = {
  tokenA: TokenArgs
  tokenB: TokenArgs
  address: string
  params: string
}

abstract class TokenPairOracle extends Uint256Oracle {
  tokenA: Token
  tokenB: Token

  constructor ({
    tokenA,
    tokenB,
    address,
    params
  }: TokenPairOracleConstructorArgs) {
    super({ address, params })
    this.tokenA = new Token(tokenA)
    this.tokenB = new Token(tokenB)
  }

  async price (): Promise<CallData> {
    return await this.read()
  }

}

export default TokenPairOracle
