import { ethers } from 'ethers'
import { Chain, Common } from '@ethereumjs/common'
import { Address } from '@ethereumjs/util'
import { Transaction } from '@ethereumjs/tx'
import { EVMResult } from '@ethereumjs/evm'
import { VM } from '@ethereumjs/vm'
import config from '../Config'
import StrategyBuilder01 from './contracts/StrategyBuilder01.json'
import PrimitiveBuilder01 from './contracts/PrimitiveBuilder01.json'
import UnsignedDataBuilder01 from './contracts/UnsignedDataBuilder01.json'
import FlatPriceCurve from './contracts/FlatPriceCurve.json'
import LinearPriceCurve from './contracts/LinearPriceCurve.json'
import QuadraticPriceCurve from './contracts/QuadraticPriceCurve.json'
import SwapIO from './contracts/SwapIO.json'
import IdsProof from '../strategies/IdsProof'
import {
  ContractCallParam,
  PrimitiveFunctionName,
  CallStruct,
  SignatureType,
  SignatureTypeEnum,
  OrderJSON,
  BigIntish
} from '@brinkninja/types'

export const signatureTypeMap: { [key in SignatureType]: SignatureTypeEnum } = {
  EIP712: SignatureTypeEnum.EIP712,
  EIP1271: SignatureTypeEnum.EIP1271
}

type EvmContractName =
  'StrategyBuilder' |
  'PrimitiveBuilder' |
  'UnsignedDataBuilder' |
  'FlatPriceCurve' |
  'LinearPriceCurve' |
  'QuadraticPriceCurve' |
  'SwapIO'

// use this randomly generated private key to sign transactions the the VM running in SDK
const caller = Address.fromString('0x21753FDE2F04Ad242cf3DE684129BE7B11817F09')
const privateKey = '0xb52943248cc157950f600feb24b2a5949b3ee818395b6525dd0ed5e6b6ccf289'
const privateKeyBuffer = Buffer.from(privateKey.slice(2), 'hex')
const signer = new ethers.Wallet(privateKey)

export class EthereumJsVm {

  readonly _strategyContractAddress: string
  readonly _primitivesContractAddress: string

  _common: Common
  _vm!: VM
  _vmInitializing: boolean = false
  _vmInitialized: boolean = false

  _nonce: number = 0
  StrategyBuilder!: ethers.Contract
  PrimitiveBuilder!: ethers.Contract
  UnsignedDataBuilder!: ethers.Contract
  FlatPriceCurve!: ethers.Contract
  LinearPriceCurve!: ethers.Contract
  QuadraticPriceCurve!: ethers.Contract
  SwapIO!: ethers.Contract

  constructor (
    strategyContractAddress: string,
    primitivesContractAddress: string
  ) {
    this._strategyContractAddress = strategyContractAddress
    this._primitivesContractAddress = primitivesContractAddress

    this._common = new Common({ chain: Chain.Mainnet })
  }

  async _initVM () {
    if (this._vmInitializing) {
      // waiting for vm to initialize
      while (!this._vmInitialized) {
        // wait for 500 ms
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } else if (!this._vmInitializing && !this._vmInitialized) {
      // initialize the vm
      this._vmInitializing = true
      this._vm = await VM.create({ common: this._common })
      
      this.StrategyBuilder = await this._deployContract(StrategyBuilder01, this._strategyContractAddress, this._primitivesContractAddress)
      this.PrimitiveBuilder = await this._deployContract(PrimitiveBuilder01)
      this.UnsignedDataBuilder = await this._deployContract(UnsignedDataBuilder01)
      this.FlatPriceCurve = await this._deployContract(FlatPriceCurve)
      this.LinearPriceCurve = await this._deployContract(LinearPriceCurve)
      this.QuadraticPriceCurve = await this._deployContract(QuadraticPriceCurve)
      this.SwapIO = await this._deployContract(SwapIO)

      this._vmInitializing = false
      this._vmInitialized = true
    }
  }

  async _deployContract (contractJSON: any, ...contractDeployParams: any[]): Promise<ethers.Contract> {
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

  async primitiveData (functionName: PrimitiveFunctionName, ...args: ContractCallParam[]): Promise<string> {
    const primitiveData = await this.callContractFn('PrimitiveBuilder', functionName as unknown as string, ...args)
    return `0x${cleanDynamicBytes(primitiveData)}`
  }

  async strategyData (
    orders: OrderJSON[] = [],
    beforeCalls: CallStruct[] = [],
    afterCalls: CallStruct[] = []
  ): Promise<string> {
    const ordersBytesArray: string[][] = orders.map(
      o => o.primitives.map(p => p.data as string)
    )

    const strategyData: string = await this.callContractFn(
      'StrategyBuilder',
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
    chainId: BigIntish
  ): Promise<string> {
    const messageHash: string = await this.callContractFn(
      'StrategyBuilder',
      `getMessageHash`,
      signatureTypeMap[signatureType],
      data,
      account,
      BigInt(chainId)
    )
    return `0x${messageHash}`
  }

  async unsignedMarketSwapData (
    recipient: string,
    tokenInIdsProof: IdsProof,
    tokenOutIdsProof: IdsProof,
    callData: CallStruct
  ): Promise<string> {
    const unsignedMarketSwapData: string = await this.callContractFn(
      'UnsignedDataBuilder',
      'unsignedMarketSwapData',
      recipient,
      tokenInIdsProof.toStruct(),
      tokenOutIdsProof.toStruct(),
      callData
    )
    return `0x${cleanDynamicBytes(unsignedMarketSwapData)}`
  }

  async unsignedLimitSwapData (
    recipient: string,
    amount: BigIntish,
    tokenInIdsProof: IdsProof,
    tokenOutIdsProof: IdsProof,
    callData: CallStruct
  ): Promise<string> {
    const unsignedLimitSwapData: string = await this.callContractFn(
      'UnsignedDataBuilder',
      'unsignedLimitSwapData',
      recipient,
      amount,
      tokenInIdsProof.toStruct(),
      tokenOutIdsProof.toStruct(),
      callData
    )
    return `0x${cleanDynamicBytes(unsignedLimitSwapData)}`
  }

  async unsignedData (orderIndex: number, unsignedCalls: string[]): Promise<string> {
    if (unsignedCalls.length === 0) {
      throw new Error(`unsignedData needs at least 1 unsignedCall`)
    }
    if (unsignedCalls.length > 10) {
      throw new Error(`unsignedData cannot have more than 10 unsignedCalls`)
    }

    const unsignedData: string = await this.callContractFn(
      'UnsignedDataBuilder',
      `unsignedData(uint8,${'bytes,'.repeat(unsignedCalls.length).slice(0, -1)})`,
      orderIndex,
      ...unsignedCalls
    )
    return `0x${cleanDynamicBytes(unsignedData)}`
  }

  async callContractFn (contractName: EvmContractName, fnName: string, ...args: ContractCallParam[]): Promise<any> {
    await this._initVM()

    const contract = this[contractName]
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

export default new EthereumJsVm(
  config['STRATEGY_TARGET_01'] as string,
  config['PRIMITIVES_01'] as string,
)
