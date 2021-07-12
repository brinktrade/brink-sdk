const { expect } = require('chai')
const { toBN: BN, utf8ToHex } = require('web3-utils')
const { accounts, web3, contract } = require('@openzeppelin/test-environment')
const config = require('@openzeppelin/test-environment/lib/config')
const { time } = require('@openzeppelin/test-helpers')
const sendEth = require('./helpers/sendEth')
const setupUniswap = require('./helpers/setupUniswap')
const setupSingletonFactory = require('./helpers/setupSingletonFactory')
const { swapFromSignedFunctionCall, AccountSigner, PrivateKeySigner } = require('../src')
const { tokenTypes } = require('../src/constants')

const [ defaultAccount, excessRecipientAddress, liqProviderA, liqProviderB ] = accounts

const chainId = 1

const AccountLogic = contract.fromArtifact('AccountLogic')
const UniV1ExcessIn = contract.fromArtifact('UniV1ExcessIn')
const UniV1ExcessOut = contract.fromArtifact('UniV1ExcessOut')
const CallExecutor = contract.fromArtifact('CallExecutor')

const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'
const ownerPrivateKey = '0x4497d1a8deb6a0b13cc85805b6392331623dd2d429db1a1cad4af2b57fcdec25'

describe('Swap', function () {
  beforeEach(async function () {
    this.callExecutor = await CallExecutor.new()
    this.singletonFactory = await setupSingletonFactory()
    this.accountLogic = await AccountLogic.new(this.callExecutor.address)

    const { factory, tokenA, tokenB, exchangeA, exchangeB } = await setupUniswap(
      liqProviderA, liqProviderB
    )
    this.tokenA = tokenA
    this.tokenB = tokenB
    this.exchangeA = exchangeA
    this.exchangeB = exchangeB
    this.excessInputSwapAdapter = await UniV1ExcessIn.new(
      factory.address, excessRecipientAddress
    )
    this.excessOutputSwapAdapter = await UniV1ExcessOut.new(
      factory.address, excessRecipientAddress
    )

    const privateKeySigner = new PrivateKeySigner(ownerPrivateKey)
    this.accountSigner = new AccountSigner({
      accountVersion: '1',
      chainId,
      signer: privateKeySigner
    })
    this.accountSigner.initFromParams(
      this.singletonFactory.address,
      this.accountLogic.address,
      chainId,
      utf8ToHex('<<account|deployment|salt>>')
    )

    this.latestBlock = await time.latestBlock()
    this.unminedBlock = this.latestBlock.add(BN(1000)) // 1,000 blocks from now
    this.minedBlock = this.latestBlock.sub(BN(1)) // 1 block ago

    this.firstBit = {
      bitmapIndex: BN(0),
      bit: BN(1)
    }
  })

  describe('isExpired()', function () {
    beforeEach(async function () {
      const { tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount } = await successfulTokenToTokenSwapParams.call(this)
      this.tokenInAddress = tokenInAddress
      this.tokenOutAddress = tokenOutAddress
      this.tokenInAmount = tokenInAmount
      this.tokenOutAmount = tokenOutAmount
    })

    describe('when expiryBlock is greater than latest block number', function () {
      it('should return false', async function () {
        const signedFnCall = await this.accountSigner.signTokenToTokenSwap(
          this.firstBit, this.tokenInAddress, this.tokenOutAddress, this.tokenInAmount, this.tokenOutAmount, this.unminedBlock
        )
        const swap = newSwap(signedFnCall)
        expect(await swap.isExpired()).to.equal(false)
      })
    })

    describe('when expiryBlock is not greater than latest block number', function () {
      it('should return true', async function () {
        const signedFnCall = await this.accountSigner.signTokenToTokenSwap(
          this.firstBit, this.tokenInAddress, this.tokenOutAddress, this.tokenInAmount, this.tokenOutAmount, this.minedBlock
        )
        const swap = newSwap(signedFnCall)
        expect(await swap.isExpired()).to.equal(true)
      })
    })
  })

  describe('requiredValue', function () {
    describe('tokenToToken', function () {
      it('should return tokenIn address and amount', async function () {
        const { tokenInAddress, tokenInAmount } = await successfulTokenToTokenSwapParams.call(this)
        const swap = await newTokenToTokenSwap.call(this)
        const { tokenAddress, value } = swap.requiredValue()
        expect(tokenAddress).to.equal(tokenInAddress)
        expect(value).to.be.bignumber.equal(tokenInAmount)
      })
    })
    describe('ethToToken', function () {
      it('should return tokenTypes.ETH and eth amount', async function () {
        const { ethAmount } = await successfulEthToTokenSwapParams.call(this)
        const swap = await newEthToTokenSwap.call(this)
        const { tokenAddress, value } = swap.requiredValue()
        expect(tokenAddress).to.equal(tokenTypes.ETH)
        expect(value).to.be.bignumber.equal(ethAmount)
      })
    })
    describe('tokenToEth', function () {
      it('should return token address and amount', async function () {
        const { tokenAddress, tokenAmount } = await successfulTokenToEthSwapParams.call(this)
        const swap = await newTokenToEthSwap.call(this)
        const { tokenAddress: requiredTokenAddress, value } = swap.requiredValue()
        expect(requiredTokenAddress).to.equal(tokenAddress)
        expect(value).to.be.bignumber.equal(tokenAmount)
      })
    })
  })

  describe('accountHasRequiredBalance()', function () {
    describe('tokenToToken', function () {
      beforeEach(async function () {
        this.swap = await newTokenToTokenSwap.call(this)
      })
      runAccountHasRequiredBalanceTests()
    })
    describe('ethToToken', function () {
      beforeEach(async function () {
        this.swap = await newEthToTokenSwap.call(this)
      })
      runAccountHasRequiredBalanceTests()
    })
    describe('tokenToEth', function () {
      beforeEach(async function () {
        this.swap = await newTokenToEthSwap.call(this)
      })
      runAccountHasRequiredBalanceTests()
    })

    function runAccountHasRequiredBalanceTests () {
      describe('when account has enough value to execute the swap', function () {
        it('should return true', async function () {
          await addRequiredSwapValue.call(this)
          expect(await this.swap.accountHasRequiredBalance()).to.equal(true)
        })
      })
      describe('when account does not have enough value to execute the swap', function () {
        it('should return false', async function () {
          expect(await this.swap.accountHasRequiredBalance()).to.equal(false)
        })
      })
    }
  })
})

function newSwap(signedFunctionCall) {
  return swapFromSignedFunctionCall({
    web3,
    signedFunctionCall,
    defaults: {
      from: defaultAccount,
      gas: config.default.contracts.defaultGas,
      gasPrice: config.default.contracts.defaultGasPrice
    }
  })
}

async function newTokenToTokenSwap () {
  const { tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock } = await successfulTokenToTokenSwapParams.call(this)
  const signedFnCall = await this.accountSigner.signTokenToTokenSwap(this.firstBit, tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock)
  return newSwap(signedFnCall)
}

async function newEthToTokenSwap () {
  const { tokenAddress, ethAmount, tokenAmount, expiryBlock } = await successfulEthToTokenSwapParams.call(this)
  const signedFnCall = await this.accountSigner.signEthToTokenSwap(this.firstBit, tokenAddress, ethAmount, tokenAmount, expiryBlock)
  return newSwap(signedFnCall)
}

async function newTokenToEthSwap () {
  const { tokenAddress, tokenAmount, ethAmount, expiryBlock } = await successfulTokenToEthSwapParams.call(this)
  const signedFnCall = await this.accountSigner.signTokenToEthSwap(this.firstBit, tokenAddress, tokenAmount, ethAmount, expiryBlock)
  return newSwap(signedFnCall)
}

async function successfulTokenToTokenSwapParams () {
  const tokenB_mp = BN(0.85 * 10 ** 18)
  const tokenA_mp = await this.excessInputSwapAdapter.tokenToTokenInputAmount(
    this.tokenA.address, this.tokenB.address, tokenB_mp
  )
  const marketSwap = [tokenA_mp, tokenB_mp]
  const excessA = BN(0.025 * 10**18)
  const tokenInAmount = marketSwap[0].add(excessA)
  const tokenOutAmount = marketSwap[1]
  return {
    tokenInAddress: this.tokenA.address,
    tokenOutAddress: this.tokenB.address,
    tokenInAmount,
    tokenOutAmount,
    expiryBlock: this.unminedBlock,
    excessInput: excessA,
    excessOutput: BN(0)
  }
}

async function successfulEthToTokenSwapParams () {
  const token_mp = BN(0.85 * 10 ** 18)
  const eth_mp = await this.excessInputSwapAdapter.ethToTokenInputAmount(
    this.tokenA.address, token_mp
  )
  const marketSwap = [eth_mp, token_mp]
  const excessEth = BN(0.0023 * 10**18)
  const ethAmount = marketSwap[0].add(excessEth)
  const tokenAmount = marketSwap[1]
  return {
    tokenAddress: this.tokenA.address,
    ethAmount,
    tokenAmount,
    expiryBlock: this.unminedBlock,
    excessInput: excessEth,
    excessOutput: BN(0)
  }
}

async function successfulTokenToEthSwapParams () {
  const token_mp = BN(1.675 * 10 ** 18)
  const eth_mp = await this.excessOutputSwapAdapter.tokenToEthOutputAmount(
    this.tokenA.address, token_mp
  )
  const marketSwap = [token_mp, eth_mp]
  const excessEth = BN(0.0412 * 10 **18)
  const tokenAmount = marketSwap[0]
  const ethAmount = marketSwap[1].sub(excessEth)
  return {
    tokenAddress: this.tokenA.address,
    tokenAmount,
    ethAmount,
    expiryBlock: this.unminedBlock,
    excessInput: BN(0),
    excessOutput: excessEth
  }
}

async function addRequiredSwapValue () {
  const accountAddress = this.swap.accountAddress()
  const { tokenAddress, value } = this.swap.requiredValue()
  if (tokenAddress === tokenTypes.ETH) {
    await sendEth(accountAddress, value)
  } else {
    // all tests use tokenA as the input token
    await this.tokenA.mint(accountAddress, value)
  }
}
