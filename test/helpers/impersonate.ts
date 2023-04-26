import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import hre, { ethers } from 'hardhat'

async function impersonate (account: string): Promise<SignerWithAddress> {
  const defaultSigner = (await ethers.getSigners())[0]

  await defaultSigner.sendTransaction({
    to: account,
    value: ethers.utils.parseEther('1000')
  })
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [account],
  })
  return await ethers.getSigner(account)
}

export default impersonate
