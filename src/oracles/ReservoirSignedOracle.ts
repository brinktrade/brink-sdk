import { utils } from 'ethers'
import { FeeAmount } from '@uniswap/v3-sdk'
import { TokenArgs } from '@brinkninja/types'
import { BigIntish } from '@brinkninja/types'
import Uint256Oracle from './Uint256Oracle'

const abiCoder = utils.defaultAbiCoder

// export type UniV3TwapConstructorArgs = {
//   collection: string
//   interval: BigIntish
//   fee?: FeeAmount
//   initCodeHashManualOverride?: string
// }

class ReservoirSignedOracle extends Uint256Oracle {

  // TODO: Implement Reservoir oracle class

  /*
    CONSTRUCTOR ARGS:
      uint8 priceKind,
      uint twapSeconds,
      address contractAddr,
      uint floorPrice,
      uint timestamp,
      bytes memory signature
  */
  constructor ({

  }: UniV3TwapConstructorArgs) {
    //
  }

}

export default UniV3Twap
