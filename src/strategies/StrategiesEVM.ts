import { ethers } from 'ethers'
import { Chain, Common } from '@ethereumjs/common'
import { Address } from '@ethereumjs/util'
import { Transaction } from '@ethereumjs/tx'
import { EVMResult } from '@ethereumjs/evm'
import { VM } from '@ethereumjs/vm'
import config from '../Config'
import StrategyBuilder01 from '../contracts/StrategyBuilder01.json'
import PrimitiveBuilder01 from '../contracts/PrimitiveBuilder01.json'
import UnsignedDataBuilder01 from '../contracts/UnsignedDataBuilder01.json'
import {
  ContractCallParams,
  PrimitiveFunctionName,
  CallStruct,
  SignatureType,
  SignatureTypeEnum,
  OrderData
} from './StrategyTypes'

export const signatureTypeMap: { [key in SignatureType]: SignatureTypeEnum } = {
  EIP712: SignatureTypeEnum.EIP712,
  EIP1271: SignatureTypeEnum.EIP1271
}

// use this randomly generated private key to sign transactions the the VM running in SDK
const caller = Address.fromString('0x21753FDE2F04Ad242cf3DE684129BE7B11817F09')
const privateKey = '0xb52943248cc157950f600feb24b2a5949b3ee818395b6525dd0ed5e6b6ccf289'
const privateKeyBuffer = Buffer.from(privateKey.slice(2), 'hex')
const signer = new ethers.Wallet(privateKey)

export class StrategiesEVM {

  readonly _strategyContractAddress: string
  readonly _primitivesContractAddress: string

  _common: Common
  _vm!: VM
  _vmInitializing: boolean = false

  _nonce: number = 0
  StrategyBuilder!: ethers.Contract
  PrimitiveBuilder!: ethers.Contract
  UnsignedDataBuilder!: ethers.Contract

  constructor (
    strategyContractAddress: string,
    primitivesContractAddress: string
  ) {
    this._strategyContractAddress = strategyContractAddress
    this._primitivesContractAddress = primitivesContractAddress

    this._common = new Common({ chain: Chain.Mainnet })
    this._initVM()
  }

  async _initVM () {
    if (!this._vm && !this._vmInitializing) {
      this._vmInitializing = true
      this._vm = await VM.create({ common: this._common })
      
      this.StrategyBuilder = await this.deployContract(StrategyBuilder01, this._strategyContractAddress, this._primitivesContractAddress)
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

  async primitiveData (functionName: PrimitiveFunctionName, ...args: ContractCallParams): Promise<string> {
    const primitiveData = await this.callContractFn(this.PrimitiveBuilder, functionName as unknown as string, ...args)
    return `0x${cleanDynamicBytes(primitiveData)}`
  }

  async strategyData (
    orders: OrderData[] = [],
    beforeCalls: CallStruct[] = [],
    afterCalls: CallStruct[] = []
  ): Promise<string> {
    const ordersBytesArray: string[][] = orders.map(
      o => o.primitives.map(p => p.data as string)
    )

    const strategyData: string = await this.callContractFn(
      this.StrategyBuilder,
      'strategyData(bytes[][],(address,bytes)[],(address,bytes)[])',
      ordersBytesArray,
      beforeCalls,
      afterCalls
    )

    // ethereumjs-vm returns the data with 28 bytes of extra 00's appended.
    // the strategies break with these extra bytes. it seems to be consistently adding
    // exactly 28 bytes of empty data, so trimming them out fixes the issue

    const strategyDataTrimmed = strategyData.slice(0, -56)
    return `0x${cleanDynamicBytes(strategyDataTrimmed)}`
  }

  async strategyMessageHash (
    signatureType: SignatureType,
    data: string,
    account: string,
    chainId: BigInt
  ): Promise<string> {
    const messageHash: string = await this.callContractFn(
      this.StrategyBuilder,
      `getMessageHash`,
      signatureTypeMap[signatureType],
      data,
      account,
      chainId
    )
    return `0x${messageHash}`
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

function cleanDynamicBytes (bytes: string): string {
  // remove the first 2 bytes32 slots (pointer and length)
  return bytes.slice(128)
}

export default new StrategiesEVM(
  config.get('STRATEGY_CONTRACT') as string,
  config.get('PRIMITIVES_CONTRACT') as string,
)
