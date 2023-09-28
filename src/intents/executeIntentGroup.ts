import { TransactionData } from '@brinkninja/types'
import SignedIntentGroup from './SignedIntentGroup'
import evm from '../internal/EthereumJsVm'
import { metaDelegateCall } from '../core'

export type ExecuteIntentArgs = {
  signedIntentGroup: SignedIntentGroup
  intentIndex: number
  unsignedCalls: string[]
  deployAccount?: boolean
}

async function executeIntentGroup ({
  signedIntentGroup,
  intentIndex,
  unsignedCalls,
  deployAccount = false
}: ExecuteIntentArgs): Promise<TransactionData> {
  const validationResult = await signedIntentGroup.validate()
  if (!validationResult.valid) {
    throw new Error(`Invalid intentGroup: ${validationResult.message}`)
  }

  const intentGroupJSON = (await signedIntentGroup.toJSON()).intentGroup
  const unsignedData = await evm.unsignedData(intentIndex, unsignedCalls)
  return await metaDelegateCall({
    signer: signedIntentGroup.signer,
    to: signedIntentGroup.intentGroupContract,
    data: intentGroupJSON.data as string,
    signature: signedIntentGroup.signature,
    unsignedData,
    deployAccount
  })
}

export default executeIntentGroup
