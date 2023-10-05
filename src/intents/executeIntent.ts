import { TransactionData } from '@brinkninja/types'
import SignedDeclaration from './SignedDeclaration'
import evm from '../internal/EthereumJsVm'
import { metaDelegateCall } from '../core'

export type ExecuteIntentArgs = {
  signedDeclaration: SignedDeclaration
  intentIndex: number
  unsignedCalls: string[]
  deployAccount?: boolean
}

async function executeIntent ({
  signedDeclaration,
  intentIndex,
  unsignedCalls,
  deployAccount = false
}: ExecuteIntentArgs): Promise<TransactionData> {
  const validationResult = await signedDeclaration.validate()
  if (!validationResult.valid) {
    throw new Error(`Invalid declaration: ${validationResult.message}`)
  }

  const DeclarationJSON = (await signedDeclaration.toJSON()).declaration
  const unsignedData = await evm.unsignedData(intentIndex, unsignedCalls)
  return await metaDelegateCall({
    signer: signedDeclaration.signer,
    to: signedDeclaration.declarationContract,
    data: DeclarationJSON.data as string,
    signature: signedDeclaration.signature,
    unsignedData,
    deployAccount
  })
}

export default executeIntent
