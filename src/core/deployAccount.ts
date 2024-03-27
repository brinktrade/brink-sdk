import { ethers } from 'ethers'
import { TransactionData } from '@brinkninja/types'
import AccountFactoryAbi from '../internal/contracts/AccountFactory.abi'
import Config from '../Config'

const { ACCOUNT_FACTORY } = Config

export type DeployAccountArgs = {
  signer: string
}

async function deployAccount ({
  signer
}: DeployAccountArgs): Promise<TransactionData> {
  const accountFactory = new ethers.Contract(ACCOUNT_FACTORY, AccountFactoryAbi)
  const txData = await accountFactory.deployAccount.populateTransaction(signer)
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: '0'
  }
}

export default deployAccount
