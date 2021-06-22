class Web3GanacheSigner {

  constructor (web3, signerAddress) {
    this.web3 = web3
    this.address = signerAddress
  }

  async sign ({ typedData }) {
    return new Promise((resolve, reject) => {
      this.web3.currentProvider.sendAsync({
        method: 'eth_signTypedData',
        params: [this.address, typedData],
        from: this.address
      }, function (err, result) {
        if (err) reject(err)
        if (result.error) reject(result.error)
        resolve(result.result)
      })
    })
  }
}

module.exports = Web3GanacheSigner
