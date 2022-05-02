// check if an object is ethers.js or web3 bignumber

const { ethers } = require('ethers')
const { isBN, isBigNumber: isWeb3BN } = require('web3-utils')
const isEthersBN = ethers.BigNumber.isBigNumber

const isBigNumber = bn => isEthersBN(bn) || isBN(bn) || isWeb3BN(bn)

module.exports = isBigNumber
