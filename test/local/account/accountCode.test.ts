import { expect } from 'chai'
import { ethers } from 'hardhat'
import { accountCode } from '@brink-sdk'

describe('accountCode', function () {
  it('when account is deployed should return contract code', async function () {
    await this.deployAccount()
    const { method, params } = accountCode({ signer: this.signerAddress })
    const code = await ethers.provider.send(method, params)
    expect(code.length).to.equal(122)
  })

  it('when account is not deployed should return 0x', async function () {
    const { method, params } = accountCode({ signer: this.signerAddress })
    const code = await ethers.provider.send(method, params)
    expect(code).to.equal('0x')
  })
})
