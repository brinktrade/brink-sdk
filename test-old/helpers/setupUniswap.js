// TODO: this setup is copied from @brinkninja/solidity. Referencing it from that project
// breaks because it's using its own @openzeppelin/test-environment context. Should
// refactor the setup code to take context from the setup caller, and/or move the setup
// code to a @brinkninja/test-helpers project where it can be shared

const { accounts, web3, contract } = require('@openzeppelin/test-environment')
const { time } = require('@openzeppelin/test-helpers')
const config = require('@openzeppelin/test-environment/lib/config')
const uniswapContracts = require('@brinkninja/solidity/uniswap/uniswapContracts')
const getBN = require('@brinkninja/solidity/test/helpers/getBN')

const [ defaultAccount ] = accounts

const TestERC20 = contract.fromArtifact('TestERC20')

const { UniswapFactory, UniswapExchange } = uniswapContracts({
  provider: web3,
  defaultSender: defaultAccount,
  defaultGas: config.default.contracts.defaultGas,
  defaultGasPrice: config.default.contracts.defaultGasPrice
})

async function setupUniswap (liqProviderA, liqProviderB) {
  const factory = await UniswapFactory.new()
  const exchangeTemplate = await UniswapExchange.new()
  await factory.initializeFactory(exchangeTemplate.address)
  const { token: tokenA, exchange: exchangeA } = await setupMarket(factory, liqProviderA, 50, 250)
  const { token: tokenB, exchange: exchangeB } = await setupMarket(factory, liqProviderB, 85, 750)
  return { factory, tokenA, exchangeA, tokenB, exchangeB }
}

async function setupMarket (factory, liqProvider, ethAmount, tokenAmount) {
  const token = await TestERC20.new('TestToken', 'TT', 18)
  await token.mint(liqProvider, getBN(10**9))
  
  await factory.createExchange(token.address)
  const exchangeAddress = await factory.getExchange(token.address)
  const exchange = await UniswapExchange.at(exchangeAddress)

  const minLiquidity = 0
  const deadline = (await time.latest()).add(time.duration.days(1))
  const ethAmountBN = getBN(ethAmount)
  const tokenAmountBN = getBN(tokenAmount)

  await token.approve(exchangeAddress, tokenAmountBN, { from: liqProvider })
  await exchange.addLiquidity(
    minLiquidity, tokenAmountBN, deadline, { value: ethAmountBN, from: liqProvider }
  )
  
  return { token, exchange }
}

module.exports = setupUniswap
