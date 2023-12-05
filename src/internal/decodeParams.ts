import { ethers } from 'ethers'
import { SolidityFunctionParamType, ContractCallParam } from '@brinkninja/types'

const abiCoder = ethers.utils.defaultAbiCoder

function decodeParams (
  { data, paramTypes }: { data: string, paramTypes: SolidityFunctionParamType[] }
): ContractCallParam[] {
  const decodedParams = abiCoder.decode(paramTypes.map(v => v.type), data)
  return decodedParams.map(v =>  v.toString())
}

export default decodeParams
