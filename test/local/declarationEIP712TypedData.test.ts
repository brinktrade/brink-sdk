import { expect } from 'chai'
import {
  Declaration,
  SegmentFunctionName,
  declarationEIP712TypedData
} from '@brink-sdk'

/*
describe('declarationEIP712TypedData', function () {
  it('should return EIP712 TypedData', async function () {
    const declarationData = await buildDeclaration()

    // get the EIP712 TypedData
    const eip712TypedData = await declarationEIP712TypedData({
      signer: this.signerAddress,
      chainId: 31337,
      declaration: declarationData
    })

    // sign the EIP712 TypedData with an ethers signer
    const signedData = await this.ethersAccountSigner._signTypedData(
      eip712TypedData.domain,
      eip712TypedData.types,
      eip712TypedData.value
    )
    
    expect(signedData.length).to.equal(132)
  })
})

async function buildDeclaration () {
  const declaration1 = new Declaration(
    {
      intents: [
        {
          segments: [
            {
              functionName: 'useBit' as SegmentFunctionName,
              params: [0, 1]
            },
            {
              functionName: 'marketSwapExactInput' as SegmentFunctionName,
              params: [
                '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648' as string,
                '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8' as string,
                '0x6399ae010188F36e469FB6E62C859dDFc558328A' as string,
                [
                  BigInt(0),
                  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as string,
                  '0x0000000000000000000000000000000000000000000000000000000000000000' as string,
                  BigInt(0),
                  false
                ],
                [
                  BigInt(0),
                  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as string,
                  '0x0000000000000000000000000000000000000000000000000000000000000000' as string,
                  BigInt(0),
                  false
                ],
                BigInt(1450000000),
                BigInt(10000),
                BigInt(0)
              ]
            }
          ]
        }
      ]
    }
  )
  return await declaration1.toJSON()
}
*/
