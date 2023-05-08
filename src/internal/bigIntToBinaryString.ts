const { padLeft } = require('web3-utils')

function bigIntToBinaryString (i: BigInt) {
  return padLeft(i.toString(2), 256, '0').split('').reverse().join('')
}

export default bigIntToBinaryString
