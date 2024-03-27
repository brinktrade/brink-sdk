import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import ERC20_abi from '../../src/internal/contracts/ERC20.abi'

async function fundWithERC20 (
  funder: SignerWithAddress,
  erc20Address: string,
  recipient: string,
  amount: BigInt
) {
  const erc20 = new ethers.Contract(erc20Address, ERC20_abi)
  return await erc20.connect(funder).transfer(recipient, amount)
}

export default fundWithERC20
