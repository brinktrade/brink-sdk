const Swap = require('./Swap')

const swapFromSignedFunctionCall = ({ web3, signedFunctionCall, defaults }) => {
  return new Swap({ web3, signedFunctionCall, defaults })
}

module.exports = swapFromSignedFunctionCall
