const _ = require('lodash')
const { toBN: BN } = require('web3-utils')

function zeroNumberCheck(paramName, number) {
  let invalid = _.isUndefined(number) || !BN(number).gt(BN(0))
  if (invalid) {
    const numStr = number && number.toString() ? BN(number).toString() : number
    throw new Error(`Invalid "${paramName}" param. ${numStr} is not a valid non-zero number`)
  }
}

module.exports = zeroNumberCheck
