import { ethers } from 'ethers'
import AccountAbi from '../internal/contracts/Account.abi'
import DeployAndCallAbi from '../internal/contracts/DeployAndCall.abi'
import { TransactionData } from '@brinkninja/types'
import Config from '../Config'
import { accountFromSigner } from '.'

const { DEPLOY_AND_CALL } = Config

export type MetaDelegateCall_EIP1271Args = {
  signer: string,
  to: string,
  data: string,
  signature: string,
  unsignedData?: string,
  deployAccount?: boolean
}

async function metaDelegateCall_EIP1271 ({
  signer,
  to,
  data,
  signature,
  unsignedData = '0x',
  deployAccount = false
}: MetaDelegateCall_EIP1271Args): Promise<TransactionData> {
  const account = accountFromSigner({ signer })
  const accountContract = new ethers.Contract(account, AccountAbi)
  const txData = await accountContract.populateTransaction.metaDelegateCall_EIP1271(to, data, signature, unsignedData)
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

export default metaDelegateCall_EIP1271
