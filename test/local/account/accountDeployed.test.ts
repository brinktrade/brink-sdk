import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
  accountDeployed,
  deployAccount
} from '@brink-sdk'

describe('accountDeployed', function () {
  it('when account is deployed should return true', async function () {
    await this.deployAccount()
    expect(await accountDeployed(this.accountAddress, ethers.provider)).to.be.true
  })

  it('when account is not deployed should return false', async function () {
    expect(await accountDeployed(this.accountAddress, ethers.provider)).to.be.false
  })
})
