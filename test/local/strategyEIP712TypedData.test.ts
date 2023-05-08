import { expect } from 'chai'
import {
  Strategy,
  PrimitiveFunctionName,
  strategyEIP712TypedData
} from '@brink-sdk'

describe('strategyEIP712TypedData', function () {
  it('should return the same EIP712 TypedData for account and signer', async function () {
    const strategyData = await buildStrategy()

    // get the EIP712 TypedData
    const eip712TypedData = await strategyEIP712TypedData({
      account: this.account.address,
      chainId: 31337,
      strategy: strategyData
    })

    // sign the EIP712 TypedData with an ethers signer
    const signedData = await this.ethersAccountSigner._signTypedData(
      eip712TypedData.domain,
      eip712TypedData.types,
      eip712TypedData.value
    )
    
    expect(signedData.length).to.equal(132)

    // get the EIP712 TypedData using signer address
    const eip712TypedData_fromSigner = await strategyEIP712TypedData({
      signer: this.signerAddress,
      chainId: 31337,
      strategy: strategyData
    })

    // sign the EIP712 TypedData with an ethers signer
    const signedData_fromSigner = await this.ethersAccountSigner._signTypedData(
      eip712TypedData_fromSigner.domain,
      eip712TypedData_fromSigner.types,
      eip712TypedData_fromSigner.value
    )

    // should be the same signedData
    expect(signedData).to.equal(signedData_fromSigner)
  })
})

async function buildStrategy () {
  const strategy1 = new Strategy(
    {
      orders: [
        {
          primitives: [
            {
              functionName: 'useBit' as PrimitiveFunctionName,
              params: [0, 1]
            },
            {
              functionName: 'marketSwapExactInput' as PrimitiveFunctionName,
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
  return await strategy1.toJSON()
}