const isAddress = require('./isAddress')

function validAddressCheck(paramName, address) {
  if (!isAddress(address)) {
    throw new Error(`Invalid "${paramName}" param. ${address} is not a valid address`)
  }
}

module.exports = validAddressCheck
