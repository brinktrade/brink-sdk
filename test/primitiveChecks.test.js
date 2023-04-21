const { ethers } = require('hardhat')
const chai = require('chai')
const BN = ethers.BigNumber.from
const BigNumber = require('bignumber.js')
const {
  bitUsed,
  checkRequireBlockNotMined,
  checkRequireUint256LowerBound
} = require('@brink-sdk')
const { expect } = chai
const { defaultAbiCoder } = ethers.utils

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

  describe('checkRequireUint256LowerBound', function () {
    it('when oracle price is less than lower bound return true', async function () {
      const paramsEncoded = defaultAbiCoder.encode(['uint256'], [BigInt(5) * BigInt(10)**BigInt(18)])
      expect(await checkRequireUint256LowerBound(ethers.provider, this.mockUint256Oracle.address, paramsEncoded, BigInt(30) * BigInt(10)**BigInt(18))).to.equal(true)
    })

    it('when oracle price is greater than lower bound return false', async function () {
      const paramsEncoded = defaultAbiCoder.encode(['uint256'], [BigInt(5) * BigInt(10)**BigInt(18)])
      expect(await checkRequireUint256LowerBound(ethers.provider, this.mockUint256Oracle.address, paramsEncoded, BigInt(1) * BigInt(10)**BigInt(18))).to.equal(false)

    })
  })

  describe('checkRequireBlockNotMined', async function () {
    it('when block has not been hit, return true', async function () {
      expect(await checkRequireBlockNotMined(ethers.provider, BigInt('10000000000000000000000000000000'))).to.equal(true)
    })
    it('when block has been passed, return false', async function () {
      expect(await checkRequireBlockNotMined(ethers.provider, 1)).to.equal(false)
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