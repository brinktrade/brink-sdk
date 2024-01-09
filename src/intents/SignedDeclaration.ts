const { getTypedData } = require('@brinkninja/utils')

import { ethers } from 'ethers'
import Declaration from './Declaration'
import { SignedDeclarationArgs, SignedDeclarationJSON, SignatureType, ValidationResult, EIP712TypedData } from '@brinkninja/types'
import Config from '../Config'
import { validResult, invalidResult } from '../internal/Validation'
import getSignerAccount from '../core/getSignerAccount'
import { MetaDelegateCallSignedParamTypes } from '../internal/constants'

class SignedDeclaration {
  chainId: number
  signer: string
  signatureType: `${SignatureType}`
  signature: string
  declaration: Declaration
  declarationContract: string
  eip712Data?: EIP712TypedData | null

  constructor(signedDeclaration: SignedDeclarationArgs) {
    this.signer = signedDeclaration.signer
    this.chainId = signedDeclaration.chainId
    this.signatureType = signedDeclaration.signatureType || 'EIP712'
    this.signature = signedDeclaration.signature
    this.declaration = new Declaration(signedDeclaration.declaration)
    this.declarationContract = signedDeclaration.declarationContract
    this.eip712Data = signedDeclaration.eip712Data
  }

  async validate (): Promise<ValidationResult> {
    const declarationValidationResult = this.declaration.validate()
    if (!declarationValidationResult.valid) {
      return declarationValidationResult
    }

    const { domain, types, value } = await this.EIP712Data()
    const recoveredAddress = ethers.utils.verifyTypedData(
      domain,
      types,
      value,
      this.signature
    )
    if (recoveredAddress.toLowerCase() !== this.signer.toLowerCase()) {
      return invalidResult('SIGNATURE_MISMATCH')
    }

    return validResult()
  }

  account (): string {
    return getSignerAccount({ signer: this.signer })
  }

  async EIP712Data (declarationData?: string): Promise<EIP712TypedData> {
    if (this.eip712Data) return this.eip712Data;

    const domain = {
      name: 'BrinkAccount',
      version: '1',
      chainId: this.chainId,
      verifyingContract: this.account()
    }
    const { typedData, typedDataHash } = getTypedData(
      domain,
      'metaDelegateCall',
      MetaDelegateCallSignedParamTypes,
      [
        this.declarationContract,
        declarationData || (await this.declaration.toJSON()).data
      ]
    )

    this.eip712Data = {
      domain,
      types: typedData.types,
      value: typedData.value,
      hash: typedDataHash
    }

    return this.eip712Data
  }

  async toJSON (): Promise<SignedDeclarationJSON> {

    const declaration = await this.declaration.toJSON()
    const eip712Data = await this.EIP712Data(declaration.data)

    return {
      eip712Data,
      account: getSignerAccount({ signer: this.signer }),
      chainId: this.chainId,
      signer: this.signer,
      signatureType: this.signatureType,
      signature: this.signature,
      declaration,
      declarationContract: this.declarationContract
    }
  }
}

export default SignedDeclaration
