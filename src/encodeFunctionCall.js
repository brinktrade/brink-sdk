const web3Abi = require('web3-eth-abi')

const encodeFunctionCall = ({ functionName, paramTypes, params }) => {
  if (!functionName) return `0x`
  const types = paramTypes.map(pt => pt.type == 'uint' ? 'uint256' : pt.type)
  const fnSig = `${functionName}(${types.join(',')})`
  const encodedFnSig = web3Abi.encodeFunctionSignature(fnSig).slice(2)
  const callData = web3Abi.encodeParameters(types, params).slice(2)
  return `0x${encodedFnSig}${callData}`
}

module.exports = encodeFunctionCall
