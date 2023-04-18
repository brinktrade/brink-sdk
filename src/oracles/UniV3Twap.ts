import { utils } from 'ethers'
import { FeeAmount } from '@uniswap/v3-sdk'
import { Token } from '../strategies'
import Config from '../Config'
import getUniV3Pool from '../utils/getUniV3Pool'
import TokenPairOracle from './TokenPairOracle'

const abiCoder = utils.defaultAbiCoder

class UniV3Twap extends TokenPairOracle {

  isInverse: boolean

  constructor (
    tokenA: Token,
    tokenB: Token,
    interval: BigInt,
    fee?: FeeAmount,
    initCodeHashManualOverride?: string
  ) {
    const isInverse = tokenA.addr.toLowerCase() > tokenB.addr.toLowerCase()
    const contractAddress = isInverse ? Config['UNIV3_TWAP_INVERSE_ADAPTER'] : Config['UNIV3_TWAP_ADAPTER']

    // params for the oracle are the UniV3 pool address and the TWAP interval
    const poolAddress = getUniV3Pool(tokenA.addr, tokenB.addr, fee, initCodeHashManualOverride)
    const paramsEncoded = abiCoder.encode(['address', 'uint32'], [poolAddress, interval])

    super(tokenA, tokenB, contractAddress, paramsEncoded)

    this.isInverse = isInverse
  }

}

export default UniV3Twap
