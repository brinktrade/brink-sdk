const { ZERO_ADDRESS } = require('../constants')
const validAddressCheck = require('./validAddressCheck')

function zeroAddressCheck(paramName, address) {
  validAddressCheck(paramName, address)
  if (address == ZERO_ADDRESS) {
    throw new Error(`Invalid "${paramName}" param. ${address} is not a valid non-zero address`)
  }
}

module.exports = zeroAddressCheck
