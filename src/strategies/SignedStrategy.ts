const { getTypedData } = require('@brinkninja/utils')

import { ethers, BigNumberish } from 'ethers'
import Strategy from './Strategy'
import { SignedStrategyArgs, SignedStrategyJSON, SignatureType, ValidationResult, EIP712TypedData } from './StrategyTypes'
import Config from '../Config'
import { validResult, invalidResult } from './Validation'
import accountFromOwner from '../account/accountFromOwner'
import { MetaDelegateCallSignedParamTypes } from '../constants'

class SignedStrategy {
  chainId: number
  signer: string
  signatureType: SignatureType
  signature: string
  strategy: Strategy
  strategyContract: string

  constructor(signedStrategy: SignedStrategyArgs) {
    this.signer = signedStrategy.signer
    this.chainId = signedStrategy.chainId
    this.signatureType = signedStrategy.signatureType || 'EIP712'
    this.signature = signedStrategy.signature
    this.strategy = new Strategy(signedStrategy.strategy)
    this.strategyContract = signedStrategy.strategyContract || Config['STRATEGY_TARGET_01'] as string
  }

  async validate (): Promise<ValidationResult> {
    const strategyValidationResult = this.strategy.validate()
    if (!strategyValidationResult.valid) {
      return strategyValidationResult
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
    return accountFromOwner(this.signer)
  }

  async EIP712Data (strategyData?: string): Promise<EIP712TypedData> {
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
        this.strategyContract,
        strategyData || (await this.strategy.toJSON()).data
      ]
    )
    return {
      domain,
      types: typedData.types,
      value: typedData.value,
      hash: typedDataHash
    }
  }

  async toJSON (): Promise<SignedStrategyJSON> {
    await this.validate()

    const strategy = await this.strategy.toJSON()
    const eip712Data = await this.EIP712Data(strategy.data)

    return {
      eip712Data,
      account: accountFromOwner(this.signer),
      chainId: this.chainId,
      signer: this.signer,
      signatureType: this.signatureType,
      signature: this.signature,
      strategy,
      strategyContract: this.strategyContract
    }
  }
}

export default SignedStrategy
