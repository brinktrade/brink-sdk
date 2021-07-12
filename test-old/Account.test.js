require('@openzeppelin/test-helpers') // for bignumber.equal chai behavior

const { expect } = require('chai')
const { toBN: BN, utf8ToHex } = require('web3-utils')
const BN_JS = require('bn.js')
const { accounts, web3, contract } = require('@openzeppelin/test-environment')
const { time } = require('@openzeppelin/test-helpers')
const deployAccount = require('./helpers/deployAccount')
const expectAsyncError = require('./helpers/expectAsyncError')
const sendEth = require('./helpers/sendEth')
const setupUniswap = require('./helpers/setupUniswap')
const setupSingletonFactory = require('./helpers/setupSingletonFactory')
const computeAccountAddress = require('../src/computeAccountAddress')
const { Account, AccountSigner, PrivateKeySigner, Web3GanacheSigner } = require('../src')

const [ a, b, liqProviderA, liqProviderB ] = accounts

const chainId = 1

const AccountLogic = contract.fromArtifact('AccountLogic')
const MockAccountLogic = contract.fromArtifact('MockAccountLogic')
const TestERC20 = contract.fromArtifact('TestERC20')
const UniV1ExcessIn = contract.fromArtifact('UniV1ExcessIn')
const UniV1ExcessOut = contract.fromArtifact('UniV1ExcessOut')
const ProxyAdminDelegated = contract.fromArtifact('ProxyAdminDelegated')
const CallExecutor = contract.fromArtifact('CallExecutor')
const DeployAndExecute = contract.fromArtifact('DeployAndExecute')
const SingletonFactoryCaller = contract.fromArtifact('SingletonFactoryCaller')

const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a121'
const excessRecipientAddress = '0x6fa19ef985b20f8ad46dd3bdfe5bcbc4d440ec35'
const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'
const ownerPrivateKey = '0x4497d1a8deb6a0b13cc85805b6392331623dd2d429db1a1cad4af2b57fcdec25'

describe('Account with PrivateKeySigner', function () {
  beforeEach(async function () {
    this.singletonFactory = await setupSingletonFactory()
    this.callExecutor = await CallExecutor.new()
    this.accountLogic = await AccountLogic.new(this.callExecutor.address)
    this.mockAccountLogic = await MockAccountLogic.new(this.callExecutor.address)
    this.singletonFactoryCaller = await SingletonFactoryCaller.new(this.singletonFactory.address)
    this.deployAndExecute = await DeployAndExecute.new(this.singletonFactoryCaller.address)


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

    this.account = new Account({
      accountVersion: '1',
      accountDeploymentSalt: utf8ToHex('<<account|deployment|salt>>'),
      chainId: 1,
      web3,
      web3Sender: this.web3Sender,
      deployerAddress: this.singletonFactoryCaller.address,
      deployAndExecuteAddress: this.deployAndExecute.address,
      create2CallerAddress: this.singletonFactory.address
    })

    this.latestBlock = await time.latestBlock()
    this.expiryBlock = this.latestBlock.add(BN(1000)) // 1,000 blocks from now
    this.expiredBlock = this.latestBlock.sub(BN(1)) // 1 block ago
  })
  
  describe('loadFromParams()', function () {
    describe('when contract code is not deployed', function () {
      it('should return false from isDeployed()', async function () {
        await this.account.loadFromParams(this.accountLogic.address, ownerAddress)
        expect(await this.account.isDeployed()).to.be.false
      })
    })

    describe('when contract code is deployed', function () {
      it('should return true from isDeployed()', async function () {
        await deployAccount(this.singletonFactory, this.accountLogic.address, ownerAddress)
        await this.account.loadFromParams(this.accountLogic.address, ownerAddress)
        expect(await this.account.isDeployed()).to.be.true
      })
    })
  })

  describe('loadFromAddress()', function () {
    describe('when address is an Account contract', function () {
      it('should not throw an error', async function () {
        const accountAddress = await deployAccount(
          this.singletonFactory, this.accountLogic.address, ownerAddress
        )
        await this.account.loadFromAddress(accountAddress)
      })
    })

    describe('when address is not a valid Account contract', function () {
      it('should throw an error', async function () {
        // set a different deployerAddress so computed addresses won't match
        this.account._deployerAddress = '0x7bf9e48a063f9835d140146e38841682abb85040'
        const accountAddress = await deployAccount(
          this.singletonFactory, this.accountLogic.address, ownerAddress
        )
        await expectAsyncError(this.account.loadFromAddress(accountAddress))
      })
    })
  })

  describe('deploy', function () {
    describe('when given valid params', function () {
      beforeEach(async function () {
        await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)
      })

      it('should deploy the account', async function () {
        expect(await this.account.isDeployed()).to.be.true
      })

      it('should set the account address', function () {
        const expectedAccountAddress = computeAccountAddress(
          this.singletonFactory.address,
          this.accountLogic.address,
          ownerAddress,
          chainId,
          utf8ToHex('<<account|deployment|salt>>')
        )
        expect(this.account.address).to.equal(expectedAccountAddress)
      })
    })
  })

  describe('deployAndTransfer', function () {
    describe('when signedFunctionCall is a valid transfer', function () {
      it('should execute the transfer', async function () {
        await this.account.loadFromParams(this.accountLogic.address, ownerAddress)

        const ethAmount = BN(0.01 * 10**18)
        this.expectedRecipientBalance = BN(await web3.eth.getBalance(recipientAddress)).add(ethAmount)
        await sendEth(this.account.address, ethAmount)
  
        const bitData = await this.account.nextBit()
        const signedTransferEthCall = await this.accountSigner.signTransferEth(bitData, recipientAddress, ethAmount)

        const promiEvent = await this.account.deployAndTransfer(signedTransferEthCall)
        await new Promise(resolve => promiEvent.onReceipt(resolve))

        // expect ETH to be transferred to recipientAddress
        expect(await web3.eth.getBalance(this.account.address)).to.be.bignumber.equal(BN(0))
        expect(await web3.eth.getBalance(recipientAddress)).to.be.bignumber.equal(this.expectedRecipientBalance)
      })
    })

    describe('when signed call is an ETH transfer and account does not have enough ETH', function () {
      it('should throw an error', async function () {
        await this.account.loadFromParams(this.accountLogic.address, ownerAddress)
        const ethAmount = BN(0.01 * 10**18)
        const bitData = await this.account.nextBit()
        const signedTransferEthCall = await this.accountSigner.signTransferEth(bitData, recipientAddress, ethAmount)
        await expectAsyncError(
          this.account.deployAndTransfer(signedTransferEthCall),
          `Can't transferEth. Account has 0 but needs ${ethAmount}`
        )
      })
    })

    describe('when signed call is a token transfer and account does not have enough token', function () {
      it('should throw an error', async function () {
        const token = await TestERC20.new('TestToken', 'TT', 18)
        await this.account.loadFromParams(this.accountLogic.address, ownerAddress)
        const tokenAmount = BN(0.01 * 10**18)
  
        const bitData = await this.account.nextBit()
        const signedTransferTokenCall = await this.accountSigner.signTransferToken(
          bitData, token.address, recipientAddress, tokenAmount
        )
        await expectAsyncError(
          this.account.deployAndTransfer(signedTransferTokenCall),
          `Can't transfer token. Account has 0 but needs ${tokenAmount.toString()}`
        )
      })
    })
  })

  describe('deployAndCall', function () {
    describe('should deploy account contract and execute a call in a single tx', function () {
      beforeEach(async function () {
        await this.account.loadFromParams(this.accountLogic.address, ownerAddress)

        const ethAmount = BN(0.01 * 10**18)
        this.expectedRecipientBalance = BN(await web3.eth.getBalance(recipientAddress)).add(ethAmount)
        await sendEth(this.account.address, ethAmount)
  
        const bitData = await this.account.nextBit()
        const signedTransferEthCall = await this.accountSigner.signTransferEth(bitData, recipientAddress, ethAmount)

        const promiEvent = await this.account.deployAndCall(signedTransferEthCall)
        await new Promise(resolve => promiEvent.onReceipt(resolve))
      })

      it('should deploy the account', async function () {
        expect(await this.account.isDeployed()).to.be.true
      })

      it('should execute the call', async function () {
        // expect ETH to be transferred to recipientAddress
        expect(await web3.eth.getBalance(this.account.address)).to.be.bignumber.equal(BN(0))
        expect(await web3.eth.getBalance(recipientAddress)).to.be.bignumber.equal(this.expectedRecipientBalance)
      })
    })
  })

  describe('bitUsed()', function () {
    describe('when bit is used', function () {
      it('should return true', async function () {
        await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)

        const { bitmapIndex, bit } = await this.account.nextBit()
        expect(await this.account.bitUsed(bitmapIndex, bit)).to.equal(false)

        // sign and execute a cancel tx to flip the bit
        const signedCancelFn = await this.accountSigner.signCancel({ bitmapIndex, bit })
        const promiEvent = await this.account.cancelTransaction(signedCancelFn)
        await new Promise(resolve => promiEvent.onReceipt(resolve))

        expect(await this.account.bitUsed(bitmapIndex, bit)).to.equal(true)
      })
    })
    describe('when bit is not used', function () {
      it('should return false', async function () {
        await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)
        const { bitmapIndex, bit } = await this.account.nextBit()
        expect(await this.account.bitUsed(bitmapIndex, bit)).to.equal(false)
      })
    })
    describe('when the account proxy is not deployed', function () {
      it('should return false', async function () {
        await this.account.loadFromParams(this.accountLogic.address, ownerAddress)
        const { bitmapIndex, bit } = await this.account.nextBit()
        expect(await this.account.bitUsed(bitmapIndex, bit)).to.equal(false)
      })
    })
  })

  describe('nextBit()', function () {
    describe('when the account proxy is deployed', function () {
      it('should return next available bit', async function () {
        await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)
        const { bitmapIndex, bit } = await this.account.nextBit()
        expect(bitmapIndex).to.be.bignumber.equal(BN(0))
        expect(bit).to.be.bignumber.equal(BN(1))
      })
    })
    describe('when the account proxy has not been deployed', function () {
      it('should return the first bit', async function () {
        await this.account.loadFromParams(this.accountLogic.address, ownerAddress)
        const { bitmapIndex, bit } = await this.account.nextBit()
        expect(bitmapIndex).to.be.bignumber.equal(BN(0))
        expect(bit).to.be.bignumber.equal(BN(1))
      })
    })
    describe('when bits have been stored consecutively', function () {
      it('should return first available bit after stored bits', async function () {
        const accountAddress = await deployAccount(
          this.singletonFactory, this.mockAccountLogic.address, ownerAddress
        )
        await this.account.loadFromAddress(accountAddress)
        const mockAccount = await MockAccountLogic.at(accountAddress)
        // mock first 3 bits flipped
        await mockAccount.__mockBitmap(BN(0), new BN_JS('111', 2))
        const { bitmapIndex, bit } = await this.account.nextBit()
        const expectedBitIndex = BN(3)
        expect(bitmapIndex).to.be.bignumber.equal(BN(0))
        expect(bit).to.be.bignumber.equal(BN(2).pow(expectedBitIndex))
      })
    })
    describe('when bits have been stored non-consecutively', function () {
      it('should return first available bit', async function () {
        const accountAddress = await deployAccount(
          this.singletonFactory, this.mockAccountLogic.address, ownerAddress
        )
        await this.account.loadFromAddress(accountAddress)
        const mockAccount = await MockAccountLogic.at(accountAddress)
        // mock first 4 bits flipped, 5th unflipped, 6 and 7th flipped
        await mockAccount.__mockBitmap(BN(0), new BN_JS(reverseBinStr('1111011'), 2))
        const { bitmapIndex, bit } = await this.account.nextBit()
        const expectedBitIndex = BN(4)
        expect(bitmapIndex).to.be.bignumber.equal(BN(0))
        expect(bit).to.be.bignumber.equal(BN(2).pow(expectedBitIndex))
      })
    })
    describe('when exactly 256 bits have been stored', function () {
      it('should return first bit from the next storage slot', async function () {
        const accountAddress = await deployAccount(
          this.singletonFactory, this.mockAccountLogic.address, ownerAddress
        )
        await this.account.loadFromAddress(accountAddress)
        const mockAccount = await MockAccountLogic.at(accountAddress)
        // mock 256 bits flipped
        await mockAccount.__mockBitmap(BN(0), new BN_JS('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111', 2))
        const { bitmapIndex, bit } = await this.account.nextBit()
        const expectedBitIndex = BN(0)
        expect(bitmapIndex).to.be.bignumber.equal(BN(1))
        expect(bit).to.be.bignumber.equal(BN(2).pow(expectedBitIndex))
      })
    })
  })

  describe('transferEth', function () {
    it('should transfer eth to recipient', async function () {
      await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)
      const accountAddress = this.account.address
      const ethAmount = BN(0.01 * 10**18)
      const recipientBalance = BN(await web3.eth.getBalance(recipientAddress))
      const expectedRecipientBalance = recipientBalance.add(ethAmount)
      await sendEth(accountAddress, ethAmount)

      const bitData = await this.account.nextBit()
      const signedTransferEthCall = await this.accountSigner.signTransferEth(bitData, recipientAddress, ethAmount)
      const promiEvent = await this.account.transferEth(signedTransferEthCall)
      await new Promise(resolve => promiEvent.onReceipt(resolve))

      const actualRecipientBalance = BN(await web3.eth.getBalance(recipientAddress))
      expect(actualRecipientBalance).to.be.bignumber.equal(expectedRecipientBalance)
      expect(BN(await web3.eth.getBalance(accountAddress))).to.be.bignumber.equal(BN(0))
    })
  })

  describe('transferToken', function () {
    it('should transfer ERC20 token to recipient', async function () {
      const token = await TestERC20.new('TestToken', 'TT', 18)
      await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)
      const accountAddress = this.account.address
      const tokenAmount = BN(0.01 * 10**18)
      await token.mint(accountAddress, tokenAmount)

      const bitData = await this.account.nextBit()
      const signedTransferTokenCall = await this.accountSigner.signTransferToken(
        bitData, token.address, recipientAddress, tokenAmount
      )
      const promiEvent = await this.account.transferToken(signedTransferTokenCall)
      await new Promise(resolve => promiEvent.onReceipt(resolve))

      expect(await token.balanceOf(recipientAddress)).to.be.bignumber.equal(tokenAmount)
      expect(await token.balanceOf(accountAddress)).to.be.bignumber.equal(BN(0))
    })
  })

  describe('swap functions', function () {
    beforeEach(async function () {
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
    })

    describe('deployAndSwap', function () {
      describe('should deploy account contract and execute a swap in a single tx', function () {
        beforeEach(async function () {
          await this.account.loadFromParams(this.accountLogic.address, ownerAddress)
  
          const token_mp = BN(0.85 * 10 ** 18)
          const eth_mp = await this.excessInputSwapAdapter.ethToTokenInputAmount(
            this.tokenA.address, token_mp
          )
          this.marketSwap = [eth_mp, token_mp]
  
          this.ethAmount = this.marketSwap[0]
          this.tokenAmount = this.marketSwap[1]
  
          const bitData = await this.account.nextBit()
          this.signedEthToTokenSwapCall = await this.accountSigner.signEthToTokenSwap(
            bitData, this.tokenA.address, this.ethAmount, this.tokenAmount, this.expiryBlock
          )
  
          await sendEth(this.account.address, this.ethAmount)
  
          const promiEvent = await this.account.deployAndSwap(
            this.signedEthToTokenSwapCall,
            this.excessInputSwapAdapter.address
          )
          await new Promise(resolve => promiEvent.onReceipt(resolve))
        })

        it('should deploy the account', async function () {
          expect(await this.account.isDeployed()).to.be.true
        })

        it('should execute the swap', async function () {
          expect(await web3.eth.getBalance(this.account.address)).to.be.bignumber.equal(BN(0))
          expect(await this.tokenA.balanceOf(this.account.address)).to.be.bignumber.equal(this.tokenAmount)
        })
      })
    })

    describe('when account is deployed', function () {
      beforeEach(async function () {
        await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)
        this.accountAddress = this.account.address
      })

      describe('tokenToTokenSwap', function () {
        beforeEach(async function () {
          const tokenB_mp = BN(0.85 * 10 ** 18)
          const tokenA_mp = await this.excessInputSwapAdapter.tokenToTokenInputAmount(
            this.tokenA.address, this.tokenB.address, tokenB_mp
          )
          this.marketSwap = [tokenA_mp, tokenB_mp]
        })

        describe('when market price is more favorable than swap price', function () {
          beforeEach(async function () {
            this.excessA = BN(0.025 * 10**18)
            this.tokenA_amount = this.marketSwap[0].add(this.excessA)
            this.tokenB_amount = this.marketSwap[1]
            await this.tokenA.mint(this.accountAddress, this.tokenA_amount)
            const bitData = await this.account.nextBit()
            this.signedTokenToTokenSwapCall = await this.accountSigner.signTokenToTokenSwap(
              bitData, this.tokenA.address, this.tokenB.address, this.tokenA_amount, this.tokenB_amount, this.expiryBlock
            )
            const promiEvent = await this.account.tokenToTokenSwap(
              this.signedTokenToTokenSwapCall,
              this.excessInputSwapAdapter.address
            )
            await new Promise(resolve => promiEvent.onReceipt(resolve))
          })

          it('should send the account their desired tokenB amount', async function () {
            expect(await this.tokenA.balanceOf(this.accountAddress)).to.be.bignumber.equal(BN(0))
            expect(await this.tokenB.balanceOf(this.accountAddress)).to.be.bignumber.equal(this.tokenB_amount)
          })

          it('should send excess to excessRecipient', async function () {
            expect(await this.tokenA.balanceOf(excessRecipientAddress)).to.be.bignumber.equal(this.excessA)
          })
        })

        describe('when account does not have enough funds for swap input', function () {
          beforeEach(async function () {
            this.tokenA_amount = this.marketSwap[0].add(BN(0.025 * 10**18))
            this.tokenB_amount = this.marketSwap[1]
            const bitData = await this.account.nextBit()
            this.signedTokenToTokenSwapCall = await this.accountSigner.signTokenToTokenSwap(
              bitData, this.tokenA.address, this.tokenB.address, this.tokenA_amount, this.tokenB_amount, this.expiryBlock
            )
          })
          it('should throw an error', async function () {
            await expectAsyncError(
              this.account.tokenToTokenSwap(
                this.signedTokenToTokenSwapCall,
                this.excessInputSwapAdapter.address
              ),
              'Swap cannot be executed, account has insufficient balance'
            )
          })
        })

        describe('when expiryBlock has been mined', function () {
          beforeEach(async function () {
            this.excessA = BN(0.025 * 10**18)
            this.tokenA_amount = this.marketSwap[0].add(this.excessA)
            this.tokenB_amount = this.marketSwap[1]
            await this.tokenA.mint(this.accountAddress, this.tokenA_amount)
            const bitData = await this.account.nextBit()
            this.signedTokenToTokenSwapCall = await this.accountSigner.signTokenToTokenSwap(
              bitData, this.tokenA.address, this.tokenB.address, this.tokenA_amount, this.tokenB_amount, this.expiredBlock
            )
          })

          it('should throw an error', async function () {
            await expectAsyncError(
              this.account.tokenToTokenSwap(
                this.signedTokenToTokenSwapCall,
                this.excessInputSwapAdapter.address
              ),
              'Swap cannot be executed, expiryBlock exceeded'
            )
          })
        })
      })

      describe('ethToTokenSwap', function () {
        beforeEach(async function () {
          const token_mp = BN(0.85 * 10 ** 18)
          const eth_mp = await this.excessInputSwapAdapter.ethToTokenInputAmount(
            this.tokenA.address, token_mp
          )
          this.marketSwap = [eth_mp, token_mp]
        })

        describe('when market price is more favorable than swap price', function () {
          beforeEach(async function () {
            this.excessRecipientBalance = BN(await web3.eth.getBalance(excessRecipientAddress))
            this.excessEth = BN(0.0023 * 10**18)
            this.ethAmount = this.marketSwap[0].add(this.excessEth)
            this.tokenAmount = this.marketSwap[1]
            await sendEth(this.accountAddress, this.ethAmount)
            const bitData = await this.account.nextBit()
            this.signedEthToTokenSwapCall = await this.accountSigner.signEthToTokenSwap(
              bitData, this.tokenA.address, this.ethAmount, this.tokenAmount, this.expiryBlock
            )
            const promiEvent = await this.account.ethToTokenSwap(
              this.signedEthToTokenSwapCall,
              this.excessInputSwapAdapter.address
            )
            await new Promise(resolve => promiEvent.onReceipt(resolve))
          })

          it('should send the account their desired token amount', async function () {
            expect(BN(await web3.eth.getBalance(this.accountAddress))).to.be.bignumber.equal(BN(0))
            expect(await this.tokenA.balanceOf(this.accountAddress)).to.be.bignumber.equal(this.tokenAmount)
          })

          it('should send excess eth to excessRecipient', async function () {
            expect(BN(await web3.eth.getBalance(excessRecipientAddress))).to.be.bignumber.equal(this.excessRecipientBalance.add(this.excessEth))
          })
        })

        describe('when account does not have enough funds for swap input', function () {
          beforeEach(async function () {
            this.ethAmount = this.marketSwap[0]
            this.tokenAmount = this.marketSwap[1]
            const bitData = await this.account.nextBit()
            this.signedEthToTokenSwapCall = await this.accountSigner.signEthToTokenSwap(
              bitData, this.tokenA.address, this.ethAmount, this.tokenAmount, this.expiryBlock
            )
            // fill the account with half the ether needed for this swap
            await sendEth(this.accountAddress, this.ethAmount.div(BN(2)))
          })
          it('should throw an error', async function () {
            await expectAsyncError(
              this.account.ethToTokenSwap(
                this.signedEthToTokenSwapCall,
                this.excessInputSwapAdapter.address
              ),
              'Swap cannot be executed, account has insufficient balance'
            )
          })
        })

        describe('when expiryBlock has been mined', function () {
          beforeEach(async function () {
            this.excessRecipientBalance = BN(await web3.eth.getBalance(excessRecipientAddress))
            this.excessEth = BN(0.0023 * 10**18)
            this.ethAmount = this.marketSwap[0].add(this.excessEth)
            this.tokenAmount = this.marketSwap[1]
            await sendEth(this.accountAddress, this.ethAmount)
            const bitData = await this.account.nextBit()
            this.signedEthToTokenSwapCall = await this.accountSigner.signEthToTokenSwap(
              bitData, this.tokenA.address, this.ethAmount, this.tokenAmount, this.expiredBlock
            )
          })
          it('should throw an error', async function () {
            await expectAsyncError(
              this.account.ethToTokenSwap(
                this.signedEthToTokenSwapCall,
                this.excessInputSwapAdapter.address
              ),
              'Swap cannot be executed, expiryBlock exceeded'
            )
          })
        })
      })

      describe('tokenToEthSwap', function () {
        beforeEach(async function () {
          const token_mp = BN(1.675 * 10 ** 18)
          const eth_mp = await this.excessOutputSwapAdapter.tokenToEthOutputAmount(
            this.tokenA.address, token_mp
          )
          this.marketSwap = [token_mp, eth_mp]
        })

        describe('when market price is more favorable than swap price', function () {
          beforeEach(async function () {
            this.excessRecipientBalance = BN(await web3.eth.getBalance(excessRecipientAddress))
            this.excessEth = BN(0.0412 * 10 **18)
            this.tokenAmount = this.marketSwap[0]
            this.ethAmount = this.marketSwap[1].sub(this.excessEth)
            const bitData = await this.account.nextBit()
            this.signedTokenToEthSwapCall = await this.accountSigner.signTokenToEthSwap(
              bitData, this.tokenA.address, this.tokenAmount, this.ethAmount, this.expiryBlock
            )
            await this.tokenA.mint(this.accountAddress, this.tokenAmount)
            const promiEvent = await this.account.tokenToEthSwap(
              this.signedTokenToEthSwapCall,
              this.excessOutputSwapAdapter.address
            )
            await new Promise(resolve => promiEvent.onReceipt(resolve))
          })

          it('should send the account their desired eth amount', async function () {
            expect(await this.tokenA.balanceOf(this.accountAddress)).to.be.bignumber.equal(BN(0))
            expect(BN(await web3.eth.getBalance(this.accountAddress))).to.be.bignumber.equal(this.ethAmount)
          })

          it('should send excess eth to excessRecipient', async function () {
            expect(BN(await web3.eth.getBalance(excessRecipientAddress))).to.be.bignumber.equal(this.excessRecipientBalance.add(this.excessEth))
          })
        })

        describe('when account does not have enough funds for swap input', function () {
          beforeEach(async function () {
            this.tokenAmount = this.marketSwap[0]
            this.ethAmount = this.marketSwap[1]
            const bitData = await this.account.nextBit()
            this.signedTokenToEthSwapCall = await this.accountSigner.signTokenToEthSwap(
              bitData, this.tokenA.address, this.tokenAmount, this.ethAmount, this.expiryBlock
            )
            // fill account with half the tokenA needed for the swap
            await this.tokenA.mint(this.accountAddress, this.tokenAmount.div(BN(2)))
          })
          it('should throw an error', async function () {
            await expectAsyncError(
              this.account.tokenToEthSwap(
                this.signedTokenToEthSwapCall,
                this.excessOutputSwapAdapter.address
              ),
              'Swap cannot be executed, account has insufficient balance'
            )
          })
        })

        describe('when expiryBlock has been mined', function () {
          beforeEach(async function () {
            this.excessRecipientBalance = BN(await web3.eth.getBalance(excessRecipientAddress))
            this.excessEth = BN(0.0412 * 10 **18)
            this.tokenAmount = this.marketSwap[0]
            this.ethAmount = this.marketSwap[1].sub(this.excessEth)
            const bitData = await this.account.nextBit()
            this.signedTokenToEthSwapCall = await this.accountSigner.signTokenToEthSwap(
              bitData, this.tokenA.address, this.tokenAmount, this.ethAmount, this.expiredBlock
            )
            await this.tokenA.mint(this.accountAddress, this.tokenAmount)
          })
          it('should throw an error', async function () {
            await expectAsyncError(
              this.account.tokenToEthSwap(
                this.signedTokenToEthSwapCall,
                this.excessOutputSwapAdapter.address
              ),
              'Swap cannot be executed, expiryBlock exceeded'
            )
          })
        })
      })
    })
  })

  describe('upgrade', function () {
    beforeEach(async function () {
      this.proxyAdminDelegated = await ProxyAdminDelegated.new()
      this.callExecutor = await CallExecutor.new()
      this.upgradedAccountLogic = await AccountLogic.new(this.callExecutor.address)
      await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)
    })

    it('should upgrade the account implementation', async function () {
      expect(await this.account.implementation()).to.equal(this.accountLogic.address)
      const bitData = await this.account.nextBit()
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        bitData, this.proxyAdminDelegated.address, this.upgradedAccountLogic.address
      )
      const promiEvent = await this.account.upgrade(signedUpgradeFnCall)
      await new Promise(resolve => promiEvent.onReceipt(resolve))
      expect(await this.account.implementation()).to.equal(this.upgradedAccountLogic.address)
    })
  })

  describe('addProxyOwner', function () {
    const newOwnerAddress = '0xf496c8b74ba78c1e10a68f8372c9d3d5d27a42f0'
    // const newOwnerPrivateKey = 'b58949ac500560461c11d622120357573315a1836a343360a2ac79107590dfb6'

    beforeEach(async function () {
      this.proxyAdminDelegated = await ProxyAdminDelegated.new()
      await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)
    })

    it('should add address as proxy owner', async function () {
      expect(await this.account.isProxyOwner(newOwnerAddress)).to.be.false
      const bitData = await this.account.nextBit()
      const signedAddProxyOwnerCall = await this.accountSigner.signAddProxyOwner(
        bitData, this.proxyAdminDelegated.address, newOwnerAddress
      )
      const promiEvent = await this.account.addProxyOwner(signedAddProxyOwnerCall)
      await new Promise(resolve => promiEvent.onReceipt(resolve))
      expect(await this.account.isProxyOwner(newOwnerAddress)).to.be.true
    })
  })

  describe('cancelTransaction', function () {
    beforeEach(async function () {
      await this.loadAndDeployAccount(this.account, this.accountLogic.address, ownerAddress)
    })

    describe('when bit being cancelled has not been used', function () {
      it('should succeed and store the bit', async function () {
        const { bitmapIndex, bit } = await this.account.nextBit()
        expect(await this.account.bitUsed(bitmapIndex, bit)).to.equal(false)
        const signedCancelFn = await this.accountSigner.signCancel({ bitmapIndex, bit })
        const promiEvent = await this.account.cancelTransaction(signedCancelFn)
        await new Promise(resolve => promiEvent.onReceipt(resolve))
        expect(await this.account.bitUsed(bitmapIndex, bit)).to.equal(true)
      })
    })

    describe('when bit being cancelled has been used', function () {
      beforeEach(async function() {
        // send a token transfer and save the salt
        const token = await TestERC20.new('TestToken', 'TT', 18)
        const tokenAmount = BN(0.01 * 10**18)
        await token.mint(this.account.address, tokenAmount)
  
        this.bitData = await this.account.nextBit()
        const signedTransferTokenCall = await this.accountSigner.signTransferToken(
          this.bitData, token.address, recipientAddress, tokenAmount
        )
        const promiEvent = await this.account.transferToken(signedTransferTokenCall)
        await new Promise(resolve => promiEvent.onReceipt(resolve))
      })

      it('should throw an error', async function () {
        const signedCancelFn = await this.accountSigner.signCancel(this.bitData)
        await expectAsyncError(
          this.account.cancelTransaction(signedCancelFn),
          `Cancel cannot be executed, bit 0:1 has been used`
        )
      })
    })
  })
})

describe('Account with Web3GanacheSigner', function () {
  beforeEach(async function () {
    this.callExecutor = await CallExecutor.new()
    this.singletonFactory = await setupSingletonFactory()
    this.accountLogic = await AccountLogic.new(this.callExecutor.address)

    this.web3PrimaryAccount = (await web3.eth.getAccounts())[0]

    const web3GanacheSigner = new Web3GanacheSigner(web3, this.web3PrimaryAccount)
    this.accountSigner = new AccountSigner({
      accountVersion: '1',
      chainId: 1,
      signer: web3GanacheSigner
    })
    this.accountSigner.initFromParams(
      this.singletonFactory.address,
      this.accountLogic.address,
      chainId,
      utf8ToHex('<<account|deployment|salt>>')
    )

    this.account = new Account({
      accountVersion: '1',
      accountDeploymentSalt: utf8ToHex('<<account|deployment|salt>>'),
      chainId: 1,
      web3,
      web3Sender: this.web3Sender,
      deployerAddress: this.singletonFactory.address
    })
  })

  it('should sign messages correctly', async function () {
    await this.loadAndDeployAccount(this.account, this.accountLogic.address, this.web3PrimaryAccount)
    const accountAddress = this.account.address
    const ethAmount = BN(0.01 * 10**18)
    const recipientBalance = BN(await web3.eth.getBalance(recipientAddress))
    const expectedRecipientBalance = recipientBalance.add(ethAmount)
    await sendEth(accountAddress, ethAmount)

    const bitData = await this.account.nextBit()
    const signedTransferEthCall = await this.accountSigner.signTransferEth(bitData, recipientAddress, ethAmount)
    const promiEvent = await this.account.transferEth(signedTransferEthCall)
    await new Promise(resolve => promiEvent.onReceipt(resolve))

    const actualRecipientBalance = BN(await web3.eth.getBalance(recipientAddress))
    expect(actualRecipientBalance).to.be.bignumber.equal(expectedRecipientBalance)
    expect(BN(await web3.eth.getBalance(accountAddress))).to.be.bignumber.equal(BN(0))
  })
})

function reverseBinStr (str) {
  return str.split('').reverse().join('')
}
