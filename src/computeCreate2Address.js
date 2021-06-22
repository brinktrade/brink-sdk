const web3Utils = require('web3-utils')
const computeInitBytecode = require('./computeInitBytecode')

const computeCreate2Address = ({
  bytecode,
  deployerAddress,
  salt,
  paramTypes,
  params
}) => {
  const initBytecode = computeInitBytecode({ bytecode, paramTypes, params })
  const codeHash = web3Utils.soliditySha3({ t: 'bytes', v: initBytecode })
  const bytes32 = web3Utils.soliditySha3(
    { t: 'uint8', v: 255 }, // 0xff
    { t: 'address', v: deployerAddress },
    { t: 'bytes32', v: salt },
    { t: 'bytes32', v: codeHash }
  )
  const address = `0x${bytes32.slice(26,66)}`
  return address
}

module.exports = computeCreate2Address
