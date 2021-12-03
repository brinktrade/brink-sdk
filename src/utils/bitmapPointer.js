const { ethers } = require('ethers')
const { soliditySha3 } = require('web3-utils')
const BN = ethers.BigNumber.from

const bitmapPointer = bitmapIndex => BN(soliditySha3('bmp')).add(BN(bitmapIndex.toString()))

module.exports = bitmapPointer
