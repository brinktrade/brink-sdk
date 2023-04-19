const { ethers } = require('hardhat')
const chai = require('chai')
const BN = ethers.BigNumber.from
const BigNumber = require('bignumber.js')
const { bitUsed } = require('@brink-sdk')
const { expect } = chai

describe('Primitive Checks', function () {
  describe('bitUsed', function () {
    it('when given bit is used, should return true', async function () {
      // mock bits 0,1,2 unused. 3,4,5 used 
      await this.mockAccountBits.__mockBitmap(BN(0), base2BN(reverseBinStr('000111')))
      const bit = BN(2).pow(BN(3))
      expect(await bitUsed(ethers.provider, this.mockAccountBits.address, 0, bit)).to.equal(true)
    })

    it('when given bit is not used, should return false', async function () {
      // mock bits 0,1,2 unused. 3,4,5 used 
      await this.mockAccountBits.__mockBitmap(BN(0), base2BN(reverseBinStr('000111')))
      const bit = BN(2).pow(BN(2))
      expect(await bitUsed(ethers.provider, this.mockAccountBits.address, 0, bit)).to.equal(false)
    })
    it('when account is not deployed, should return false', async function () {
      const bit = BN(2).pow(BN(3))
      expect(await bitUsed(ethers.provider, this.account.address, 0, bit)).to.equal(false)
    })
  })

})

// convert a base 2 (binary) string to an ethers.js BigNumber
function base2BN (str) {
  // uses the bignumber.js lib which supports base 2 conversion
  return BN(new BigNumber(str, 2).toFixed())
}

function reverseBinStr (str) {
  return str.split('').reverse().join('')
}