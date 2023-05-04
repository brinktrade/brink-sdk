import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
  accountDeployed,
  deployAccount
} from '@brink-sdk'

describe.only('accountDeployed', function () {
  it('when account is deployed should return true', async function () {
    const deployTx = await deployAccount(this.ownerAddress)
    await this.defaultSigner.sendTransaction({ to: deployTx.tx.to, data: deployTx.tx.data })
    expect(await accountDeployed(this.accountAddress, ethers.provider)).to.be.true
  })

  it('when account is not deployed should return false', async function () {
    expect(await accountDeployed(this.accountAddress, ethers.provider)).to.be.false
  })
})
