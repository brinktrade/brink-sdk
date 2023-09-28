import { utils } from 'ethers'
import { FeeAmount } from '@uniswap/v3-sdk'
import { TokenArgs } from '@brinkninja/types'
import { Token } from '../intents'
import Config from '../Config'
import { BigIntish } from '@brinkninja/types'
import getUniV3Pool from '../internal/getUniV3Pool'
import TokenPairOracle from './TokenPairOracle'

const abiCoder = utils.defaultAbiCoder

export type UniV3TwapConstructorArgs = {
  tokenA: TokenArgs
  tokenB: TokenArgs
  interval: BigIntish
  fee?: FeeAmount
  initCodeHashManualOverride?: string
}

class UniV3Twap extends TokenPairOracle {

  isInverse: boolean

  constructor ({
    tokenA,
    tokenB,
    interval,
    fee = FeeAmount.MEDIUM,
    initCodeHashManualOverride
  }: UniV3TwapConstructorArgs) {
    const isInverse = tokenA.address.toLowerCase() > tokenB.address.toLowerCase()
    const address = isInverse ? Config['TWAP_INVERSE_ADAPTER_02'] : Config['TWAP_ADAPTER_02']

    // params for the oracle are the UniV3 pool address and the TWAP interval
    const poolAddress = getUniV3Pool(tokenA.address, tokenB.address, fee, initCodeHashManualOverride)
    const params = abiCoder.encode(['address', 'uint32'], [poolAddress, BigInt(interval)])

    super({ tokenA, tokenB, address, params })

    this.isInverse = isInverse
  }

}

export default UniV3Twap
