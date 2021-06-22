const { accounts, web3 } = require('@openzeppelin/test-environment')

const [ defaultAccount ] = accounts

async function sendEth(to, value) {
  const tx = await web3.eth.sendTransaction({ from: defaultAccount, to, value })
  return tx
}

module.exports = sendEth
