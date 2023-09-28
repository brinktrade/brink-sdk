const { getTypedData } = require('@brinkninja/utils')

import { ethers } from 'ethers'
import IntentGroup from './IntentGroup'
import { SignedIntentGroupArgs, SignedIntentGroupJSON, SignatureType, ValidationResult, EIP712TypedData } from '@brinkninja/types'
import Config from '../Config'
import { validResult, invalidResult } from '../internal/Validation'
import getSignerAccount from '../core/getSignerAccount'
import { MetaDelegateCallSignedParamTypes } from '../internal/constants'

class SignedIntentGroup {
  chainId: number
  signer: string
  signatureType: SignatureType
  signature: string
  intentGroup: IntentGroup
  intentGroupContract: string

  constructor(signedIntentGroup: SignedIntentGroupArgs) {
    this.signer = signedIntentGroup.signer
    this.chainId = signedIntentGroup.chainId
    this.signatureType = signedIntentGroup.signatureType || 'EIP712'
    this.signature = signedIntentGroup.signature
    this.intentGroup = new IntentGroup(signedIntentGroup.intentGroup)
    this.intentGroupContract = signedIntentGroup.intentGroupContract || Config['STRATEGY_TARGET_01'] as string
  }

  async validate (): Promise<ValidationResult> {
    const intentGroupValidationResult = this.intentGroup.validate()
    if (!intentGroupValidationResult.valid) {
      return intentGroupValidationResult
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

  async EIP712Data (intentGroupData?: string): Promise<EIP712TypedData> {
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
        this.intentGroupContract,
        intentGroupData || (await this.intentGroup.toJSON()).data
      ]
    )
    return {
      domain,
      types: typedData.types,
      value: typedData.value,
      hash: typedDataHash
    }
  }

  async toJSON (): Promise<SignedIntentGroupJSON> {
    await this.validate()

    const intentGroup = await this.intentGroup.toJSON()
    const eip712Data = await this.EIP712Data(intentGroup.data)

    return {
      eip712Data,
      account: getSignerAccount({ signer: this.signer }),
      chainId: this.chainId,
      signer: this.signer,
      signatureType: this.signatureType,
      signature: this.signature,
      intentGroup,
      intentGroupContract: this.intentGroupContract
    }
  }
}

export default SignedIntentGroup
