import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import ERC20_abi from '../../src/contracts/ERC20.abi'

async function fundWithERC20 (
  funder: SignerWithAddress,
  erc20Address: string,
  recipient: string,
  amount: BigInt | BigNumber
) {
  const erc20 = new ethers.Contract(erc20Address, ERC20_abi)
  return await erc20.connect(funder).transfer(recipient, amount)
}

export default fundWithERC20
