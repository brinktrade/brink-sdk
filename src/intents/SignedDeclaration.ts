const { getTypedData } = require('@brinkninja/utils')
import Declaration from './Declaration'
import { SignedDeclarationArgs, SignedDeclarationJSON, SignatureType, ValidationResult, EIP712TypedData } from '@brinkninja/types'
import { validResult, invalidResult, EIP1271TransactionData, validateEIP712Signature } from '../internal/Validation'
import getSignerAccount from '../core/getSignerAccount'
import { MetaDelegateCallSignedParamTypes } from '../internal/constants'

class SignedDeclaration {
  chainId: number
  signer: string
  signatureType: `${SignatureType}`
  signature: string
  declaration: Declaration
  declarationContract: string

  constructor(signedDeclaration: SignedDeclarationArgs) {
    this.signer = signedDeclaration.signer
    this.chainId = signedDeclaration.chainId
    this.signatureType = signedDeclaration.signatureType || 'EIP712'
    this.signature = signedDeclaration.signature
    this.declaration = new Declaration(signedDeclaration.declaration)
    this.declarationContract = signedDeclaration.declarationContract
  }

  async validate (): Promise<ValidationResult> {
    const declarationValidationResult = this.declaration.validate()
    if (!declarationValidationResult.valid) {
      return declarationValidationResult
    }
    
    const eip712Data = await this.EIP712Data()

    if  (this.signatureType == 'EIP712') {
      return validateEIP712Signature({ ...eip712Data, signer: this.signer, signature: this.signature })
    }

    if (this.signatureType == 'EIP1271' ){  
      return {
        ...validResult(),
        signatureType: this.signatureType,
        eip1271ValidationCall: await EIP1271TransactionData({ hash: eip712Data.hash, signer: this.signer }),
      }
    }

    return invalidResult('INVALID_SIGNATURE_TYPE')
  }

  account (): string {
    return getSignerAccount({ signer: this.signer })
  }

  async EIP712Data (declarationData?: string): Promise<EIP712TypedData> {
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
    return {
      domain,
      types: typedData.types,
      value: typedData.value,
      hash: typedDataHash
    }
  }

  async toJSON ({ excludeEIP712Data = false, excludeData = false } = {}): Promise<SignedDeclarationJSON> {

    const declaration = await this.declaration.toJSON({ excludeData })

    const signedDeclarationJSON: SignedDeclarationJSON = {
      account: getSignerAccount({ signer: this.signer }),
      chainId: this.chainId,
      signer: this.signer,
      signatureType: this.signatureType,
      signature: this.signature,
      declaration,
      declarationContract: this.declarationContract
    }

    if (!excludeEIP712Data) {
      signedDeclarationJSON.eip712Data = await this.EIP712Data(declaration.data)
    }

    return signedDeclarationJSON;
  }
}

export default SignedDeclaration
