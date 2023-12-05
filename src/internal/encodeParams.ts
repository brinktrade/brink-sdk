import { ethers } from 'ethers'
import { SolidityFunctionParamType, ContractCallParam } from '@brinkninja/types'

const abiCoder = ethers.utils.defaultAbiCoder

function encodeParams (
  { params, paramTypes }: { params: ContractCallParam[], paramTypes: SolidityFunctionParamType[] }
): string {
  return abiCoder.encode(paramTypes.map(v => v.type), params)
}

export default encodeParams
