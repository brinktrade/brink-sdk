import { ethers } from 'ethers'
import { TransactionData } from '../strategies/StrategyTypes'
import AccountFactoryAbi from '../contracts/AccountFactory.abi'
const { ACCOUNT_FACTORY } = require('@brinkninja/core/constants')

async function deployAccount (owner: string): Promise<TransactionData> {
  const accountFactory = new ethers.Contract(ACCOUNT_FACTORY, AccountFactoryAbi)
  const txData = await accountFactory.populateTransaction.deployAccount(owner)
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: BigInt(0)
  }
}

export default deployAccount
