class EthersSigner {
  constructor (ethersSigner) {
    this._signer = ethersSigner
  }

  async sign ({ typedData }) {
    const signedData = await this._signer._signTypedData(
      typedData.domain,
      typedData.types,
      typedData.value
    )
    return signedData
  }

  async address () {
    const address = await this._signer.getAddress()
    return address
  }
}

module.exports = EthersSigner
