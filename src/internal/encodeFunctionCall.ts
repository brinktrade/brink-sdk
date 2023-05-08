import { ContractCallParams } from '../Types'

const web3Abi = require('web3-eth-abi')

const encodeFunctionCall = (
  {
    functionName,
    paramTypes,
    params
  }: {
    functionName: string,
    paramTypes: string[],
    params: ContractCallParams
  }
): string => {
  if (!functionName) return `0x`
  const types = paramTypes.map(pt => pt == 'uint' ? 'uint256' : pt)
  const fnSig = `${functionName}(${types.join(',')})`
  const encodedFnSig = web3Abi.encodeFunctionSignature(fnSig).slice(2)
  const paramDiff = paramTypes.length - params.length
  const modifiedParamTypes = paramTypes.slice(0, paramTypes.length - paramDiff)
  const callData = web3Abi.encodeParameters(modifiedParamTypes, params).slice(2)
  return `0x${encodedFnSig}${callData}`
}

export default encodeFunctionCall
