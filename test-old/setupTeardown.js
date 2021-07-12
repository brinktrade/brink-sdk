const { generateMnemonic } = require('bip39')
const { web3 } = require('@openzeppelin/test-environment')
const initWeb3Sender = require('./helpers/web3Sender')
const loadAndDeployAccount = require('./helpers/loadAndDeployAccount')

before(async function () {
  this.web3 = web3
  this.mnemonic = generateMnemonic()
  this.web3Sender = await initWeb3Sender(web3)
  this.loadAndDeployAccount = loadAndDeployAccount.bind(this)
})
