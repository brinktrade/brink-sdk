import {
  SwapAmountArgs,
  SwapAmountJSON,
  SolidityFunctionParamType,
  ContractCallParam,
  SwapAmountContractName
} from '@brinkninja/types'
import Config from '../../Config'
import _ from 'lodash'
import { decodeParams, encodeParams } from '../../internal'

class SwapAmount {

  contractName: SwapAmountContractName
  contractAddress: string
  paramsBytesData: string
  params: ContractCallParam[]
  paramTypes: SolidityFunctionParamType[]

  constructor ({
    contractName,
    contractAddress,
    paramsBytesData,
    params
  }: SwapAmountArgs) {
    if (!contractName && !contractAddress) {
      throw new Error('SwapAmount: contractName or contractAddress required')
    }
    if (!paramsBytesData && !params) {
      throw new Error('SwapAmount: paramsBytesData or params required')
    }

    let swapAmountContractData: SwapAmountContractData | undefined
    this.paramsBytesData = ''
    this.params = []

    if (contractName) {
      swapAmountContractData = swapAmountContractMap[contractName]
      if (!swapAmountContractData) {
        throw new Error(`SwapAmount: invalid contractName "${contractName}"`)
      }
    }

    if (contractAddress) {
      swapAmountContractData = _.find(swapAmountContractMap, d => d.address.toLowerCase() == contractAddress.toLowerCase())
      if (!swapAmountContractData) {
        throw new Error(`SwapAmount: invalid contractAddress "${contractAddress}"`)
      }
      if (contractName && contractName !== swapAmountContractData.name) {
        throw new Error(`SwapAmount: invalid contractAddress provided for contract "${contractName}"`)
      }
    }

    this.contractName = (swapAmountContractData as SwapAmountContractData).name
    this.contractAddress = (swapAmountContractData as SwapAmountContractData).address
    this.paramTypes = (swapAmountContractData as SwapAmountContractData).paramTypes

    let paramsUnformatted: ContractCallParam[] = []
    if (params) {
      paramsUnformatted = params
      this.paramsBytesData = encodeParams({ params, paramTypes: this.paramTypes }).toLowerCase()
    }

    if (paramsBytesData) {
      if (this.paramsBytesData && this.paramsBytesData !== paramsBytesData.toLowerCase()) {
        throw new Error('SwapAmount: params provided do not match paramsBytesData')
      }
      paramsUnformatted = decodeParams({ data: paramsBytesData, paramTypes: this.paramTypes })
      this.paramsBytesData = paramsBytesData.toLowerCase()
    }

    this.params = formatParams(paramsUnformatted)
  }

  toJSON (): SwapAmountJSON {
    return {
      contractName: this.contractName,
      contractAddress: this.contractAddress,
      paramsBytesData: this.paramsBytesData,
      params: this.params,
      paramTypes: this.paramTypes,
    }
  }

}

const {
  FIXED_SWAP_AMOUNT_01,
  BLOCK_INTERVAL_DUTCH_AUCTION_AMOUNT_01
} = Config

type SwapAmountContractData = {
  name: SwapAmountContractName
  address: string
  paramTypes: SolidityFunctionParamType[]
}

const swapAmountContractMap: Record<SwapAmountContractName, SwapAmountContractData> = {
  FixedSwapAmount01: {
    name: 'FixedSwapAmount01',
    address: FIXED_SWAP_AMOUNT_01,
    paramTypes: [
      { name: 'amount', type: 'uint256' }
    ]
  },
  BlockIntervalDutchAuctionAmount01: {
    name: 'BlockIntervalDutchAuctionAmount01',
    address: BLOCK_INTERVAL_DUTCH_AUCTION_AMOUNT_01,
    paramTypes: [
      { name: 'oppositeTokenAmount', type: 'uint256' },
      { name: 'blockIntervalId', type: 'uint64' },
      { name: 'firstAuctionStartBlock', type: 'uint128' },
      { name: 'auctionDelayBlocks', type: 'uint128' },
      { name: 'auctionDurationBlocks', type: 'uint128' },
      { name: 'startPercentE6', type: 'int24' },
      { name: 'endPercentE6', type: 'int24' },
      { name: 'priceX96Oracle', type: 'address' },
      { name: 'priceX96OracleParams', type: 'bytes' }
    ]
  }
}

// converts bigint's to strings
function formatParams (paramsArray: ContractCallParam[]): ContractCallParam[] {
  return paramsArray.map(p => {
    if (p.toString) {
      return p.toString().toLowerCase()
    } else {
      return p
    }
  })
}

export default SwapAmount
