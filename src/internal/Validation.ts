import { InvalidReason, TransactionData, ValidationResult, invalidReasonMessages } from '@brinkninja/types'
import EIP1271Abi from './contracts/EIP1271.abi'
import { ethers } from 'ethers'

export function invalidResult (reason: InvalidReason): ValidationResult {
  return {
    valid: false,
    reason,
    message: invalidReasonMessages[reason]
  }
}

export function validResult (): ValidationResult {
  return { valid: true }
}

export async function EIP1271TransactionData ({ hash, signer }: { hash: string, signer:string }): Promise<TransactionData> {
  const eip1271Contract = new ethers.Contract(signer, EIP1271Abi)
  const txData = await eip1271Contract.isValidSignature.populateTransaction(hash, '0x')
  return {
    to: txData.to as string,
    data: txData.data as string,
    value: '0'
  }
}

export async function validateEIP712Signature ({ signer, domain, types, value, signature }: { signer: string, domain: ethers.TypedDataDomain, types: any, value: any, signature: string }): Promise<ValidationResult> {
  const recoveredAddress = ethers.verifyTypedData(
    domain,
    types,
    value,
    signature
  )
  if (recoveredAddress.toLowerCase() !== signer.toLowerCase()) {
    return invalidResult('SIGNATURE_MISMATCH')
  }
  return {
    ...validResult(),
    signatureType: 'EIP712',
  }
}