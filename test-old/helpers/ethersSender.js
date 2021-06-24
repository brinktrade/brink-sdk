class EthersSender {

  constructor (web3) {
    this._web3 = web3
  }

  async init () {
    this._from = (await this._web3.eth.getAccounts())[0]
  }

  send ({ to, data }) {
    return new Promise(resolve => {
      const onSendingCallbacks = []
      const onSentCallbacks = []
      const onTransactionHashCallbacks = []
      const onReceiptCallbacks = []
      const onConfirmationCallbacks = []
      const onErrorCallbacks = []

      const promiEventWrapper = {
        onSending: fn => onSendingCallbacks.push(fn),
        onSent: fn => onSentCallbacks.push(fn),
        onTransactionHash: fn => onTransactionHashCallbacks.push(fn),
        onReceipt: fn => onReceiptCallbacks.push(fn),
        onConfirmation: fn => onConfirmationCallbacks.push(fn),
        onError: fn => onErrorCallbacks.push(fn)
      }

      this._web3.eth.sendTransaction({
        from: this._from,
        to,
        data,
        gasPrice: 15 * 10**9,
        gas: 800000
      })
      .on('sending', payload => onSendingCallbacks.forEach(fn => fn(payload)))
      .on('sent', payload => onSentCallbacks.forEach(fn => fn(payload)))
      .on('transactionHash', txHash => onTransactionHashCallbacks.forEach(fn => fn(txHash)))
      .on('receipt', receipt => onReceiptCallbacks.forEach(fn => fn(receipt)))
      .on('confirmation', (confNumber, receipt, latestBlockHash) => onConfirmationCallbacks.forEach(fn => fn(confNumber, receipt, latestBlockHash)))
      .on('error', error => onErrorCallbacks.forEach(fn => fn(error)))

      resolve(promiEventWrapper)
    })
  }
}

let _web3Sender

const initWeb3Sender = async web3 => {
  if (!_web3Sender) {
    _web3Sender = new Web3Sender(web3)
    await _web3Sender.init()
  }
  return _web3Sender
}

module.exports = EthersSender