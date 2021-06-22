class Web3MetamaskSigner {

  constructor (ethereum, signerAddress) {
    this.ethereum = ethereum
    this.address = signerAddress
  }

  async sign ({ typedData }) {
    const dataStr = JSON.stringify(typedData)

    let signerAddress = this.address
    if (!signerAddress) {
      signerAddress = await this.ethereum.selectedAddress
      console.log('Web3MetamaskSigner: ethereum.selectedAddress: ', signerAddress)
    }

    console.log('Web3MetamaskSigner: typedData: ', typedData)
    console.log('Web3MetamaskSigner: signerAddress: ', signerAddress)

    const res = await this.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [signerAddress, dataStr],
      from: signerAddress
    })
    
    if (res.error) {
      throw new Error(`Web3MetamaskSigner: Error: `, res.error)
    }

    console.log(`Web3MetamaskSigner: signature: `, res)

    return res
  }
}

module.exports = Web3MetamaskSigner
