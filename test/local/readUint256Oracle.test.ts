import { ethers } from 'ethers'
import { expect } from 'chai'
import { readUint256Oracle } from '@brink-sdk'

const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder()

describe('readUint256Oracle()', function () {
  it('should read oracle value', async function () {
    const params = defaultAbiCoder.encode(['uint256'], [BigInt(5) * BigInt(10)**BigInt(18)])
    const oracleCall = await readUint256Oracle({
      address: this.mockUint256Oracle.address,
      params
    })
    const uintVal = await this.defaultSigner.call(oracleCall)
    expect(BigInt(uintVal)).to.equal(BigInt('15000000000000000000'))
  })
})
