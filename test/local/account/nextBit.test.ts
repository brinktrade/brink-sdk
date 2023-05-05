import { ethers } from 'hardhat'
import { nextBit } from '@brink-sdk'
import { expectBigIntEqual } from '../../helpers'

describe.only('nextBit()', function () {
  describe('when account is deployed', function () {
    it('should return next available bit', async function () {
      await this.deployAccount()
      const { bitmapIndex, bit } = await nextBit({ account: this.accountAddress, provider: ethers.provider })
      expectBigIntEqual(bitmapIndex, BigInt(0))
      expectBigIntEqual(bit, BigInt(1))
    })
  })

  describe('when account has not been deployed', function () {
    it('should return the first bit', async function () {
      const { bitmapIndex, bit } = await nextBit({ account: this.accountAddress, provider: ethers.provider })
      expectBigIntEqual(bitmapIndex, BigInt(0))
      expectBigIntEqual(bit, BigInt(1))
    })
  })

  describe('when bits have been stored consecutively', function () {
    it('should return first available bit after stored bits', async function () {
      await this.deployAccount()
      const bitmaps = { 0: binaryToHex('111') }
      const { bitmapIndex, bit } = await nextBit({ account: this.accountAddress, bitmaps })
      expectBigIntEqual(bitmapIndex, BigInt(0))
      expectBigIntEqual(bit, BigInt(2**3))
    })
  })

  describe('when bits have been stored non-consecutively', function () {
    it('should return first available bit', async function () {
      await this.deployAccount()
      // first 4 bits flipped, 5th unflipped, 6 and 7th flipped
      const bitmaps = { 0: binaryToHex(reverseBinStr('1111011')) }
      const { bitmapIndex, bit } = await nextBit({ account: this.accountAddress, bitmaps })
      expectBigIntEqual(bitmapIndex, BigInt(0))
      expectBigIntEqual(bit, BigInt(2**4))
    })
  })

  describe('when exactly 256 bits have been stored', function () {
    it('should return first bit from the next storage slot', async function () {
      await this.deployAccount()
      // mock 256 bits flipped
      const bitmaps = {
        0: binaryToHex('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'),
        1: '0x00'
      }
      const { bitmapIndex, bit } = await nextBit({ account: this.accountAddress, bitmaps })
      expectBigIntEqual(bitmapIndex, BigInt(1))
      expectBigIntEqual(bit, BigInt(2**0))
    })
  })
})

function binaryToHex (binaryStr: string): string {
  const binaryBigInt = BigInt('0b' + binaryStr)
  return `0x${binaryBigInt.toString(16)}`
}

function reverseBinStr (str: string): string {
  return str.split('').reverse().join('')
}
