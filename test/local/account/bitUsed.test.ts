import { expect } from 'chai'
import { bitUsed } from '@brink-sdk'


describe('bitUsed', function () {
  it('when given bit is used, should return true', function () {
    // mock bits 0,1,2 unused. 3,4,5 used 
    const bitmap = binaryToHex(reverseBinStr('000111'))
    const bit = BigInt(2)**BigInt(3)
    expect(bitUsed({ bitmap, bit })).to.equal(true)
  })

  it('when given bit is not used, should return false', function () {
    // mock bits 0,1,2 unused. 3,4,5 used 
    const bitmap = binaryToHex(reverseBinStr('000111'))
    const bit = BigInt(2)**BigInt(2)
    expect(bitUsed({ bitmap, bit })).to.equal(false)
  })

  it('when bitmap is empty, should return false', function () {
    const bitmap = binaryToHex('0')
    const bit = BigInt(2)**BigInt(3)
    expect(bitUsed({ bitmap, bit })).to.equal(false)
  })
})

function binaryToHex (binaryStr: string): string {
  const binaryBigInt = BigInt('0b' + binaryStr)
  return `0x${binaryBigInt.toString(16)}`
}

function reverseBinStr (str: string): string {
  return str.split('').reverse().join('')
}
