const { soliditySha3 } = require('web3-utils')

const bitmapPointer = bitmapIndex => soliditySha3(
  { t: 'string', v: 'bmp' },
  { t: 'uint256', v: bitmapIndex.toString() }
)

module.exports = bitmapPointer
