import { ethers } from 'hardhat'
import { expect } from 'chai'
import {
  cancel,
  cancelWithSignature,
  cancelEIP712TypedData
} from '@brink-sdk'

const BMP_0 = '0x0000000000000000000000000000000000000000000000000000000000000000'
const BMP_1 = '0x0000000000000000000000000000000000000000000000000000000000000001'

describe('cancel', function () {
  it('cancel with signature when account is deployed', async function () {
    await this.deployAccount()

    const eip712Data = await cancelEIP712TypedData({
      signer: this.signerAddress, chainId: 31337, bitmapIndex: BigInt(0), bit: BigInt(1)
    })

    const signature = await this.ethersAccountSigner._signTypedData(
      eip712Data.domain,
      eip712Data.types,
      eip712Data.value
    )

    const txData = await cancelWithSignature({
      signer: this.signerAddress,
      bitmapIndex: BigInt(0),
      bit: BigInt(1),
      signature
    })

    expect(await this.loadBitmap(BigInt(0))).to.equal(BMP_0)
    await this.defaultSigner.sendTransaction(txData)
    expect(await this.loadBitmap(BigInt(0))).to.equal(BMP_1)
  })

  it('cancel with signature when account is not deployed', async function () {
    const eip712Data = await cancelEIP712TypedData({
      signer: this.signerAddress, chainId: 31337, bitmapIndex: BigInt(0), bit: BigInt(1)
    })

    const signature = await this.ethersAccountSigner._signTypedData(
      eip712Data.domain,
      eip712Data.types,
      eip712Data.value
    )

    const txData = await cancelWithSignature({
      signer: this.signerAddress,
      bitmapIndex: BigInt(0),
      bit: BigInt(1),
      signature,
      deployAccount: true
    })

    expect(await ethers.provider.getCode(this.accountAddress)).to.equal('0x')
    await this.defaultSigner.sendTransaction(txData)
    expect(await this.loadBitmap(BigInt(0))).to.equal(BMP_1)
  })

  it('cancel direct to account', async function () {
    await this.deployAccount()
    const txData = await cancel({
      signer: this.signerAddress,
      bitmapIndex: BigInt(0),
      bit: BigInt(1)
    })

    expect(await this.loadBitmap(BigInt(0))).to.equal(BMP_0)
    await this.ethersAccountSigner.sendTransaction(txData)
    expect(await this.loadBitmap(BigInt(0))).to.equal(BMP_1)
  })
})
