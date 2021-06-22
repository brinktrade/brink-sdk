const EthHash = require('eth-lib/lib/hash')
const web3Utils = require('web3-utils')

const hashEthereumMessage = (message) => {
  const messageBytes = web3Utils.isHexStrict(message) ? web3Utils.hexToBytes(message) : message
  const messageBuffer = Buffer.from(messageBytes)
  const preamble = '\x19Ethereum Signed Message:\n' + messageBytes.length
  const preambleBuffer = Buffer.from(preamble)
  const ethMessage = Buffer.concat([preambleBuffer, messageBuffer])
  return EthHash.keccak256s(ethMessage)
}

module.exports = hashEthereumMessage
