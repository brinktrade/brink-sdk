import { expect } from 'chai'
import {
  Declaration,
  Token,
  TokenArgs,
  SegmentArgs,
  declarationEIP712TypedData,
  SignedDeclaration,
  DeclarationArgs,
  SignedDeclarationJSON
} from '@brink-sdk'

const { INTENT_TARGET_01, SEGMENTS_01 } = require('@brinkninja/config').mainnet

describe('SignedDeclaration', function () {
  describe('validate()', function () {
    it('should return valid for a valid SignedDeclaration', async function () {
      const declarationData = await buildDeclaration()
      const signedDeclaration = await signDeclaration(this.ethersAccountSigner, declarationData)
      expect((await signedDeclaration.validate()).valid).to.equal(true)
    })

    it('SignedDeclaration where signer does not match signature recovered address should be invalid', async function () {
      const declarationData = await buildDeclaration()
      let signedDeclaration = await signDeclaration(this.ethersAccountSigner, declarationData)
      signedDeclaration.signature = '0xa6d6160d57568bde2a1ca2f623cf8814e06d75ee174389e5325110f7029311c2192404dc20a07e9b71cc8747102612c081b4c20ed4f16b37cb3980dd7bd8df1c1b'
      const validationResult = await signedDeclaration.validate()
      expect(validationResult.valid).to.equal(false)
      expect(validationResult.reason).to.equal('SIGNATURE_MISMATCH')
    })
  })

  describe('.toJSON()', function () {
    it('should build SignedDeclaration and convert to JSON', async function () {
      const declarationData = await buildDeclaration()
      const signedDeclaration = await signDeclaration(this.ethersAccountSigner, declarationData)
      const json = await signedDeclaration.toJSON()
    })

    it('should build SignedDeclaration and convert to JSON, excludeData', async function () {
      const declarationData = await buildDeclaration()
      const signedDeclaration = await signDeclaration(this.ethersAccountSigner, declarationData)
      const signedDeclarationJson = await signedDeclaration.toJSON({ excludeData: true, excludeEIP712Data: true })

      expect(signedDeclarationJson.eip712Data).to.be.undefined
      expect(signedDeclarationJson.declaration.data).to.be.undefined
    })

    it('should build SignedDeclaration and convert to JSON, excludeEIP712Data', async function () {
      const declarationData = await buildDeclaration()
      const signedDeclaration = await signDeclaration(this.ethersAccountSigner, declarationData)
      const signedDeclarationJson = await signedDeclaration.toJSON({ excludeEIP712Data: true })
      expect(signedDeclarationJson.eip712Data).to.be.undefined
      expect(signedDeclarationJson.declaration.data).to.be.ok

    })

    it('should build SignedDeclaration and convert to JSON, excludeData', async function () {
      const declarationData = await buildDeclaration()
      const signedDeclaration = await signDeclaration(this.ethersAccountSigner, declarationData)
      const signedDeclarationJson = await signedDeclaration.toJSON({ excludeData: true })

      expect(signedDeclarationJson.eip712Data).to.be.ok
      expect(signedDeclarationJson.declaration.data).to.be.undefined

      expectUndefinedSegmentData(signedDeclarationJson)
    })

  })
})

function expectUndefinedSegmentData(signedDeclarationJson: SignedDeclarationJSON) {
  for (let intent of signedDeclarationJson.declaration.intents) {
    for (let segment of intent.segments) {
      expect(segment.data).to.be.undefined
    }
  }
}

async function buildDeclaration () {
  const declaration1 = new Declaration(
    {
      intents: [
        {
          segments: [
            {
              functionName: 'useBit',
              params: {
                index: BigInt(0),
                value: BigInt(1)
              }
            } as SegmentArgs,
            {
              functionName: 'marketSwapExactInput',
              params: {
                oracle: {
                  address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
                  params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
                },
                signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
                tokenIn: new Token({ address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }) as TokenArgs,
                tokenOut: new Token({ address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }) as TokenArgs,
                tokenInAmount: BigInt(1450000000),
                feePercent: BigInt(10000),
                feeMin: BigInt(0)
              }
            } as SegmentArgs
          ]
        }
      ],
      segmentsContract: SEGMENTS_01
    }
  )
  return await declaration1.toJSON()
}

async function signDeclaration (ethersAccountSigner: any, declaration: DeclarationArgs): Promise<SignedDeclaration> {
  const chainId = 31337

  const eip712TypedData = await declarationEIP712TypedData({
    signer: ethersAccountSigner.address,
    chainId,
    declaration,
    declarationContract: INTENT_TARGET_01
  })

  // sign the EIP712 TypedData with an ethers signer
  const signature = await ethersAccountSigner._signTypedData(
    eip712TypedData.domain,
    eip712TypedData.types,
    eip712TypedData.value
  )

  return new SignedDeclaration({
    declaration,
    signature,
    chainId,
    signer: ethersAccountSigner.address,
    declarationContract: INTENT_TARGET_01
  })
}
