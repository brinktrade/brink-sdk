import { ethers } from 'ethers'
import { EVMAction } from '../strategies/StrategyTypes'
import AccountFactoryAbi from '../contracts/AccountFactory.abi'
const { ACCOUNT_FACTORY } = require('@brinkninja/core/constants')

async function deployAccount (owner: string): Promise<EVMAction> {
  const accountFactory = new ethers.Contract(ACCOUNT_FACTORY, AccountFactoryAbi)
  const txData = await accountFactory.populateTransaction.deployAccount(owner)

  // TODO: just use EVMTransaction, no need for call/deploy

  return {
    tx: {
      to: txData.to || '0x',
      data: txData.data || '0x',
      value: BigInt(0)
    },
    type: 'transaction'
  }
}

export default deployAccount
