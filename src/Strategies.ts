import { ethers } from 'ethers'
import { Chain, Hardfork, Common } from '@ethereumjs/common'
import { Address } from '@ethereumjs/util'
import { Transaction } from '@ethereumjs/tx'
import { VM } from '@ethereumjs/vm'
import { Block } from '@ethereumjs/block'
import StrategyBuilder01 from './contracts/StrategyBuilder01.json'
import PrimitiveBuilder01 from './contracts/PrimitiveBuilder01.json'

// seed: giraffe beach sick act item alley expire leg sunny focus sunset beach pattern left poem
const caller = Address.fromString('0x21753FDE2F04Ad242cf3DE684129BE7B11817F09')
const privateKey = '0xb52943248cc157950f600feb24b2a5949b3ee818395b6525dd0ed5e6b6ccf289'
const privateKeyBuffer = Buffer.from(privateKey.slice(2), 'hex')
const signer = new ethers.Wallet(privateKey)

class Strategies {

  readonly _strategyTargetAddress: string
  readonly _primitivesAddress: string

  _common: Common
  // _block: Block

  constructor (
    strategyTargetAddress: string,
    primitivesAddress: string
  ) {
    this._strategyTargetAddress = strategyTargetAddress
    this._primitivesAddress = primitivesAddress


    this._common = new Common({ chain: Chain.Mainnet })
    // this._block = Block.fromBlockData({ header: { extraData: Buffer.alloc(97) } }, { common: this._common })
  }

  async getSomething () {
    const vm = await VM.create({ common: this._common })
    const addr = await this.deployStrategyBuilder(vm)
    console.log("DEPLOYED: ", addr?.toString())
    const ret = await this.callFn(vm, addr)
    console.log('useBit() call returned: ', ret)
  }

  async callFn (vm: VM, contractAddr: Address) {
    const factory = new ethers.ContractFactory(PrimitiveBuilder01.abi, PrimitiveBuilder01.bytecode.object)
    const contract = factory.attach(contractAddr.toString())
    const tx = await contract.populateTransaction.useBit(1, 2**5)
    // console.log('useBit tx: ', tx)

    const res = await vm.evm.runCall({
      to: contractAddr,
      caller: caller,
      origin: caller,
      data: Buffer.from(tx.data?.slice(2) || '', 'hex')
    })
  
    if (res.execResult.exceptionError) {
      throw res.execResult.exceptionError
    }

    return res.execResult.returnValue.toString('hex')
  }

  async deployStrategyBuilder(
    vm: VM
  ): Promise<Address> {
    // // deploying StrategyBuilder01
    // const factory = new ethers.ContractFactory(StrategyBuilder01.abi, StrategyBuilder01.bytecode.object)
    // const { data } = factory.getDeployTransaction(
    //   this._strategyTargetAddress,
    //   this._primitivesAddress
    // )

    // deploying PrimitiveBuilder01
    const factory = new ethers.ContractFactory(PrimitiveBuilder01.abi, PrimitiveBuilder01.bytecode.object)
    const { data } = factory.getDeployTransaction()

    const tx = {
      to: Address.zero().toString(),
      data,
      gasLimit: 1000000, // Gas limit for the transaction
      gasPrice: ethers.utils.parseUnits("20", "gwei"), // Gas price for the transaction
      value: 0, // Ether value to send with the transaction
    }
  
    const parsedTx = ethers.utils.parseTransaction(await signer.signTransaction(tx))
    // console.log('parsedTx: ', parsedTx)

    const vmTx = Transaction.fromTxData({
      data: parsedTx.data,
      nonce: BigInt(0),
      value: BigInt(0),
      gasPrice: 7,
      gasLimit: 2_000_000
    }, { common: this._common }).sign(privateKeyBuffer)
    // console.log('vmTx: ', vmTx)

    const result = await vm.runTx({
      tx: vmTx,
      skipBalance: true,
      skipBlockGasLimitValidation: true
    })
    // console.log('result: ', result)

    if (result.execResult.exceptionError) {
      throw result.execResult.exceptionError
    }
  
    return result.createdAddress!
  }
}



export default Strategies
