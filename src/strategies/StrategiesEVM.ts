import { ethers } from 'ethers'
import { Chain, Common } from '@ethereumjs/common'
import { Address } from '@ethereumjs/util'
import { Transaction } from '@ethereumjs/tx'
import { EVMResult } from '@ethereumjs/evm'
import { VM } from '@ethereumjs/vm'
import StrategyBuilder01 from '../contracts/StrategyBuilder01.json'
import OrderBuilder01 from '../contracts/OrderBuilder01.json'
import OrdersBuilder01 from '../contracts/OrdersBuilder01.json'
import PrimitiveBuilder01 from '../contracts/PrimitiveBuilder01.json'
import UnsignedDataBuilder01 from '../contracts/UnsignedDataBuilder01.json'
import { Bytes } from '../utils/SolidityTypes'
import { ContractCallParams, PrimitiveFunctionName } from './StrategyTypes'

// use this randomly generated private key to sign transactions the the VM running in SDK
const caller = Address.fromString('0x21753FDE2F04Ad242cf3DE684129BE7B11817F09')
const privateKey = '0xb52943248cc157950f600feb24b2a5949b3ee818395b6525dd0ed5e6b6ccf289'
const privateKeyBuffer = Buffer.from(privateKey.slice(2), 'hex')
const signer = new ethers.Wallet(privateKey)

export class StrategiesEVM {

  readonly _strategyTargetAddress: string
  readonly _primitivesAddress: string

  _common: Common
  _vm!: VM
  _vmInitializing: boolean = false

  _nonce: number = 0
  StrategyBuilder!: ethers.Contract
  OrderBuilder!: ethers.Contract
  OrdersBuilder!: ethers.Contract
  PrimitiveBuilder!: ethers.Contract
  UnsignedDataBuilder!: ethers.Contract

  constructor (
    strategyTargetAddress: string,
    primitivesAddress: string
  ) {
    this._strategyTargetAddress = strategyTargetAddress
    this._primitivesAddress = primitivesAddress

    this._common = new Common({ chain: Chain.Mainnet })
    this._initVM()
  }

  async _initVM () {
    if (!this._vm && !this._vmInitializing) {
      this._vmInitializing = true
      this._vm = await VM.create({ common: this._common })
      
      this.StrategyBuilder = await this.deployContract(StrategyBuilder01, this._strategyTargetAddress, this._primitivesAddress)
      this.OrderBuilder = await this.deployContract(OrderBuilder01)
      this.OrdersBuilder = await this.deployContract(OrdersBuilder01)
      this.PrimitiveBuilder = await this.deployContract(PrimitiveBuilder01)
      this.UnsignedDataBuilder = await this.deployContract(UnsignedDataBuilder01)
      
      this._vmInitializing = false
    }
  }

  async deployContract (contractJSON: any, ...contractDeployParams: any[]): Promise<ethers.Contract> {
    await this._initVM()

    const factory = new ethers.ContractFactory(contractJSON.abi, contractJSON.bytecode.object)
    const { data } = factory.getDeployTransaction(...contractDeployParams)
    const parsedTx = ethers.utils.parseTransaction(await signer.signTransaction({ data }))

    const vmTx = Transaction.fromTxData({
      data: parsedTx.data,
      nonce: BigInt(this._nonce),
      value: BigInt(0),
      gasPrice: 7,
      gasLimit: 2_000_000
    }, { common: this._common }).sign(privateKeyBuffer)
    this._nonce++

    const result = await this._vm.runTx({
      tx: vmTx,
      skipBalance: true,
      skipBlockGasLimitValidation: true
    })
    this.handleEvmResultError(result)
  
    if(!result.createdAddress) {
      throw new Error('Contract not deployed')
    }

    return factory.attach(result.createdAddress.toString())
  }

  async callPrimitive (functionName: PrimitiveFunctionName, ...args: ContractCallParams): Promise<Bytes> {
    const primitiveData = await this.callContractFn(this.PrimitiveBuilder, functionName as unknown as string, ...args)
    return `0x${primitiveData}`
  }

  async orderData (...args: [Bytes, boolean][]): Promise<Bytes> {
    const orderData = await this.callContractFn(
      this.OrderBuilder,
      `order(${Array(args.length).fill('(bytes,bool)').join(',')})`,
      ...args
    )
    return `0x${orderData}`
  }

  async callContractFn (contract: ethers.Contract, fnName: string, ...args: ContractCallParams): Promise<any> {
    await this._initVM()

    const tx = await contract.populateTransaction[fnName](...args)

    const result = await this._vm.evm.runCall({
      to: Address.fromString(contract.address),
      caller: caller,
      origin: caller,
      data: Buffer.from(tx.data?.slice(2) || '', 'hex')
    })
    this.handleEvmResultError(result)

    return result.execResult.returnValue.toString('hex')
  }

  handleEvmResultError(result: EVMResult) {
    if (result.execResult.exceptionError) {
      const { exceptionError } = result.execResult
      throw new Error(`${exceptionError.errorType}: ${exceptionError.error}`)
    }
  }
}

// TODO: move these to config
export default new StrategiesEVM(
  "0x0a8A4c2aF510Afe2A40D230696cAcA6967f75BbF",
  "0xD35d062aC72C7afE566b1002819d129b6DfF3d34"
)