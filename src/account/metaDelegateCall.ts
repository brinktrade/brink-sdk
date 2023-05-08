import { ethers } from 'ethers'
import { accountFromSigner } from '.'
import AccountAbi from '../contracts/Account.abi'
import DeployAndCallAbi from '../contracts/DeployAndCall.abi'
import { TransactionData } from '../strategies/StrategyTypes'
import Config from '../Config'

const { DEPLOY_AND_CALL } = Config

export type MetaDelegateCallArgs = {
  signer: string,
  to: string,
  data: string,
  signature: string,
  unsignedData?: string,
  deployAccount?: boolean
}

async function metaDelegateCall ({
  signer,
  to,
  data,
  signature,
  unsignedData = '0x',
  deployAccount = false
}: MetaDelegateCallArgs): Promise<TransactionData> {
  const account = accountFromSigner(signer as string)

  const accountContract = new ethers.Contract(account as string, AccountAbi)
  const txData = await accountContract.populateTransaction.metaDelegateCall(to, data, signature, unsignedData)
  if (!deployAccount) {
    return {
      to: txData.to as string,
      data: txData.data as string,
      value: BigInt(0)
    }
  } else {
    const deployAndCallContract = new ethers.Contract(DEPLOY_AND_CALL, DeployAndCallAbi)
    const deployAndCallTxData = await deployAndCallContract.populateTransaction.deployAndCall(signer, txData.data)
    return {
      to: deployAndCallTxData.to as string,
      data: deployAndCallTxData.data as string,
      value: BigInt(0)
    }
  }
}

export default metaDelegateCall
