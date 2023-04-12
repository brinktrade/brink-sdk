import { Token } from '@uniswap/sdk-core'
import { computePoolAddress, FeeAmount } from '@uniswap/v3-sdk'
import Config from '../Config'

const { UNIV3_FACTORY } = Config
const defaultFee = FeeAmount.MEDIUM

function getUniV3Pool(tokenA: string, tokenB: string, fee: FeeAmount = defaultFee, initCodeHashManualOverride?: string): string {
  const tokenA_tkn = new Token(1, tokenA, 0, '', '')
  const tokenB_tkn = new Token(1, tokenB, 0, '', '')
  return computePoolAddress({
    factoryAddress: UNIV3_FACTORY,
    tokenA: tokenA_tkn,
    tokenB: tokenB_tkn,
    fee,
    initCodeHashManualOverride
  })
}

export default getUniV3Pool
