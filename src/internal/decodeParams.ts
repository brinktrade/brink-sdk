import { ethers } from 'ethers'
import { SolidityFunctionParamType, ContractCallParam } from '@brinkninja/types'

const abiCoder = ethers.utils.defaultAbiCoder

function decodeParams (
  { data, paramTypes }: { data: string, paramTypes: SolidityFunctionParamType[] }
): ContractCallParam[] {
  let decodedParams
  try {
    decodedParams = abiCoder.decode(paramTypes.map(v => v.type), data)
  } catch (err: any) {
    throw new Error(`Error decoding params data for types ${JSON.stringify(paramTypes)}: ${err.message}`)
  }
  return decodedParams.map(v =>  v.toString().toLowerCase())
}

export default decodeParams
