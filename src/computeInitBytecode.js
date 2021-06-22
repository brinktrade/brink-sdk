const ethJsAbi = require('ethereumjs-abi')
const { bufferToHex } = require('ethereumjs-util')

const computeInitBytecode = ({ bytecode, paramTypes, params }) => {
  const encodedParameters = bufferToHex(
    ethJsAbi.rawEncode(paramTypes, params)
  ).replace('0x', '')
  return `${bytecode}${encodedParameters}`
}

module.exports = computeInitBytecode
