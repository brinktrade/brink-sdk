import { ethers } from 'ethers'
import { SolidityFunctionParamType, ContractCallParam } from '@brinkninja/types'

const abiCoder = ethers.utils.defaultAbiCoder

function encodeParams (
  { params, paramTypes }: { params: ContractCallParam[], paramTypes: SolidityFunctionParamType[] }
): string {
  let data: string
  try {
    data = abiCoder.encode(paramTypes.map(v => v.type), params)
  } catch (err: any) {
    throw new Error(`Error encoding params [${params}]: ${err.message}`)
  }
  return data
}

export default encodeParams
