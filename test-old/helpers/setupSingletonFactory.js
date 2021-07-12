// TODO: this setup is copied from @brinkninja/solidity. Referencing it from that project
// breaks because it's using its own @openzeppelin/test-environment context. Should
// refactor the setup code to take context from the setup caller, and/or move the setup
// code to a @brinkninja/test-helpers project where it can be shared

const { accounts, web3 } = require('@openzeppelin/test-environment')
const config = require('@openzeppelin/test-environment/lib/config')
const singletonFactoryContract = require('@brinkninja/solidity/singletonFactory/singletonFactoryContract')

const [ defaultAccount ] = accounts

const { SingletonFactory } = singletonFactoryContract({
  provider: web3,
  defaultSender: defaultAccount,
  defaultGas: config.default.contracts.defaultGas,
  defaultGasPrice: config.default.contracts.defaultGasPrice
})

async function setupSingletonFactory () {
  const singletonFactory = await SingletonFactory.new()
  return singletonFactory
}

module.exports = setupSingletonFactory
