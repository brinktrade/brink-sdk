const web3Abi = require('web3-eth-abi')

const encodeFunctionCall = ({ functionName, paramTypes, params }) => { // new input boolean
  if (!functionName) return `0x`
  const types = paramTypes.map(pt => pt.type == 'uint' ? 'uint256' : pt.type)
  const fnSig = `${functionName}(${types.join(',')})`
  const encodedFnSig = web3Abi.encodeFunctionSignature(fnSig).slice(2)
  // remove to and data here
  const paramDiff = paramTypes.length - params.length
  const modifiedParamTypes = paramTypes.slice(0, paramTypes.length - paramDiff)
  console.log(modifiedParamTypes)
  const callData = web3Abi.encodeParameters(modifiedParamTypes, params).slice(2)
  return `0x${encodedFnSig}${callData}`
}

module.exports = encodeFunctionCall
