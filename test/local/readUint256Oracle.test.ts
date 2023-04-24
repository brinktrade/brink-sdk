import { ethers } from 'hardhat'
import { expect } from 'chai'
import { readUint256Oracle } from '@brink-sdk'

const { defaultAbiCoder } = ethers.utils

describe('readUint256Oracle()', function () {
  it('should read oracle value', async function () {
    const paramsEncoded = defaultAbiCoder.encode(['uint256'], [BigInt(5) * BigInt(10)**BigInt(18)])

    const uintVal = await readUint256Oracle(
      ethers.provider,
      this.mockUint256Oracle.address,
      paramsEncoded
    )
    expect(uintVal).to.equal(BigInt('15000000000000000000'))
  })
})
