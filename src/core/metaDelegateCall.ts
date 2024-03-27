import { ethers } from 'ethers'
import { getSignerAccount } from '.'
import AccountAbi from '../internal/contracts/Account.abi'
import DeployAndCallAbi from '../internal/contracts/DeployAndCall.abi'
import { TransactionData } from '@brinkninja/types'
import Config from '../Config'
import { sigToValidECDSA } from '../internal'

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
  const account = getSignerAccount({ signer })

  const accountContract = new ethers.Contract(account as string, AccountAbi)
  const txData = await accountContract.metaDelegateCall.populateTransaction(
    to,
    data,
    sigToValidECDSA(signature).signature,
    unsignedData
  )
  if (!deployAccount) {
    return {
      to: txData.to as string,
      data: txData.data as string,
      value: '0'
    }
  } else {
    const deployAndCallContract = new ethers.Contract(DEPLOY_AND_CALL, DeployAndCallAbi)
    const deployAndCallTxData = await deployAndCallContract.deployAndCall.populateTransaction(signer, txData.data)
    return {
      to: deployAndCallTxData.to as string,
      data: deployAndCallTxData.data as string,
      value: '0'
    }
  }
}

export default metaDelegateCall
