const { getTypedData } = require('@brinkninja/utils')

import { ethers, BigNumberish } from 'ethers'
import Strategy from './Strategy'
import { SignedStrategyData, SignatureType, ValidationResult } from './StrategyTypes'
import Config from '../Config'
import { validResult, invalidResult } from './Validation'
import proxyAccountFromOwner from '../proxyAccountFromOwner'
import { metaDelegateCallSignedParamTypes } from '../constants'

class SignedStrategy {
  hash: string
  account: string
  chainId: BigInt
  signer: string
  signatureType: SignatureType
  signature: string
  strategy: Strategy
  strategyContract: string

  constructor(signedStrategyData: SignedStrategyData) {
    this.hash = signedStrategyData.hash
    this.account = signedStrategyData.account
    this.signer = signedStrategyData.signer
    this.chainId = signedStrategyData.chainId
    this.signatureType = signedStrategyData.signatureType
    this.signature = signedStrategyData.signature
    this.strategy = new Strategy(signedStrategyData.strategy)
    this.strategyContract = Config['STRATEGY_CONTRACT'] as string
  }

  async validate (): Promise<ValidationResult> {
    const strategyValidationResult = this.strategy.validate()
    if (!strategyValidationResult.valid) {
      return strategyValidationResult
    }

    if (proxyAccountFromOwner(this.signer).toLowerCase() != this.account.toLowerCase()) {
      return invalidResult('ACCOUNT_MISMATCH')
    }

    const domain = {
      name: 'BrinkAccount',
      version: '1',
      chainId: this.chainId as BigNumberish,
      verifyingContract: this.account
    }

    // TODO: switch for EIP712 vs EIP1271. Right now this assumes every strategy is EIP712 signed
    const strategyData = (await this.strategy.toJSON()).data
    const { typedData, typedDataHash } = getTypedData(
      domain,
      'metaDelegateCall',
      metaDelegateCallSignedParamTypes,
      [ this.strategyContract, strategyData ]
    )
    if (typedDataHash.toLowerCase() !== this.hash.toLowerCase()) {
      return invalidResult('HASH_MISMATCH')
    }

    const recoveredAddress = ethers.utils.verifyTypedData(
      domain,
      typedData.types,
      typedData.value,
      this.signature
    )
    if (recoveredAddress.toLowerCase() !== this.signer.toLowerCase()) {
      return invalidResult('SIGNATURE_MISMATCH')
    }

    return validResult()
  }

  async toJSON () {
    return {
      hash: this.hash,
      account: this.account,
      chainId: this.chainId,
      signer: this.signer,
      signatureType: this.signatureType,
      signature: this.signature,
      strategy: await this.strategy.toJSON(),
      strategyContract: this.strategyContract
    }
  }
}

export default SignedStrategy
