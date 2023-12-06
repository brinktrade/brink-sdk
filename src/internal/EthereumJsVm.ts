import { ethers, providers } from 'ethers'
import { Chain, Common } from '@ethereumjs/common'
import { Address } from '@ethereumjs/util'
import { Transaction } from '@ethereumjs/tx'
import { EVMResult } from '@ethereumjs/evm'
import { VM } from '@ethereumjs/vm'
import config from '../Config'
import IntentBuilder01 from './contracts/IntentBuilder01.json'
import SegmentBuilder01 from './contracts/SegmentBuilder01.json'
import UnsignedDataBuilder01 from './contracts/UnsignedDataBuilder01.json'
import FlatPriceCurve from './contracts/FlatPriceCurve.json'
import LinearPriceCurve from './contracts/LinearPriceCurve.json'
import QuadraticPriceCurve from './contracts/QuadraticPriceCurve.json'
import SwapIO from './contracts/SwapIO.json'
import BlockIntervalDutchAuctionAmount01 from './contracts/BlockIntervalDutchAuctionAmount01.json'
import IdsProof from '../intents/IdsProof'
import {
  ContractCallParam,
  SegmentFunctionName,
  CallStruct,
  SignatureType,
  SignatureTypeEnum,
  IntentJSON,
  BigIntish
} from '@brinkninja/types'

export const signatureTypeMap: { [key in SignatureType]: SignatureTypeEnum } = {
  EIP712: SignatureTypeEnum.EIP712,
  EIP1271: SignatureTypeEnum.EIP1271
}

type EvmContractName =
  'IntentBuilder' |
  'SegmentBuilder' |
  'UnsignedDataBuilder' |
  'FlatPriceCurve' |
  'LinearPriceCurve' |
  'QuadraticPriceCurve' |
  'SwapIO' |
  'BlockIntervalDutchAuctionAmount01'

// use this randomly generated private key to sign transactions the the VM running in SDK
const caller = Address.fromString('0x21753FDE2F04Ad242cf3DE684129BE7B11817F09')
const privateKey = '0xb52943248cc157950f600feb24b2a5949b3ee818395b6525dd0ed5e6b6ccf289'
const privateKeyBuffer = Buffer.from(privateKey.slice(2), 'hex')
const signer = new ethers.Wallet(privateKey)

export class EthereumJsVm {

  _common: Common
  _vm!: VM
  _vmInitializing: boolean = false
  _vmInitialized: boolean = false

  _nonce: number = 0
  IntentBuilder!: ethers.Contract
  SegmentBuilder!: ethers.Contract
  UnsignedDataBuilder!: ethers.Contract
  FlatPriceCurve!: ethers.Contract
  LinearPriceCurve!: ethers.Contract
  QuadraticPriceCurve!: ethers.Contract
  SwapIO!: ethers.Contract
  BlockIntervalDutchAuctionAmount01!: ethers.Contract

  constructor () {
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
      
      this.IntentBuilder = await this._deployContract(IntentBuilder01)
      this.SegmentBuilder = await this._deployContract(SegmentBuilder01)
      this.UnsignedDataBuilder = await this._deployContract(UnsignedDataBuilder01)
      this.FlatPriceCurve = await this._deployContract(FlatPriceCurve)
      this.LinearPriceCurve = await this._deployContract(LinearPriceCurve)
      this.QuadraticPriceCurve = await this._deployContract(QuadraticPriceCurve)
      this.SwapIO = await this._deployContract(SwapIO)
      this.BlockIntervalDutchAuctionAmount01 = await this._deployContract(BlockIntervalDutchAuctionAmount01)

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

  async segmentData (functionName: SegmentFunctionName, ...args: ContractCallParam[]): Promise<string> {
    const segmentData = await this.callContractFn('SegmentBuilder', functionName as unknown as string, ...args)
    return `0x${cleanDynamicBytes(segmentData)}`
  }

  async DeclarationData (
    intents: IntentJSON [] = [],
    segmentsContract: string,
    beforeCalls: CallStruct[] = [],
    afterCalls: CallStruct[] = []
  ): Promise<string> {
    const intentsBytesArray: string[][] = intents.map(
      i => i.segments.map(s => s.data as string)
    )

    const declarationIData: string = await this.callContractFn(
      'IntentBuilder',
      'declarationData(bytes[][],address,(address,bytes)[],(address,bytes)[])',
      intentsBytesArray,
      segmentsContract,
      beforeCalls,
      afterCalls
    )

    // ethereumjs-vm returns the data with 28 bytes of extra 00's appended.
    // the declarations break with these extra bytes. it seems to be consistently adding
    // exactly 28 bytes of empty data, so trimming them out fixes the issue

    const declarationIDataTrimmed = declarationIData.slice(0, -56)
    return `0x${cleanDynamicBytes(declarationIDataTrimmed)}`
  }

  async declarationMessageHash (
    signatureType: SignatureType,
    data: string,
    account: string,
    chainId: BigIntish,
    intentTarget: string
  ): Promise<string> {
    const messageHash: string = await this.callContractFn(
      'IntentBuilder',
      `getMessageHash`,
      signatureTypeMap[signatureType],
      data,
      account,
      BigInt(chainId),
      intentTarget
    )
    return `0x${messageHash}`
  }

  async unsignedSwapData (
    recipient: string,
    tokenInIdsProof: IdsProof,
    tokenOutIdsProof: IdsProof,
    callData: CallStruct,
    signature: string
  ): Promise<string> {
    const unsignedSwapData: string = await this.callContractFn(
      'UnsignedDataBuilder',
      'unsignedSwapData',
      recipient,
      tokenInIdsProof.toStruct(),
      tokenOutIdsProof.toStruct(),
      callData,
      signature
    )
    return `0x${cleanDynamicBytes(unsignedSwapData)}`
  }

  async getAuctionAmount (
    blockNumber: string,
    previousAuctionFilledBlock: string,
    oppositeTokenAmount: string,
    firstAuctionStartBlock: string,
    auctionDelayBlocks: string,
    auctionDurationBlocks: string,
    startPercentE6: string,
    endPercentE6: string,
    priceX96: string
  ): Promise<bigint> {
    const getAuctionAmountData: string = await this.callContractFn(
      'BlockIntervalDutchAuctionAmount01',
      'getAuctionAmount',
      blockNumber,
      previousAuctionFilledBlock,
      oppositeTokenAmount,
      firstAuctionStartBlock,
      auctionDelayBlocks,
      auctionDurationBlocks,
      startPercentE6,
      endPercentE6,
      priceX96
    )
    return BigInt(`0x${getAuctionAmountData}`)
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

  async unsignedData (intentIndex: number, unsignedCalls: string[]): Promise<string> {
    if (unsignedCalls.length === 0) {
      throw new Error(`unsignedData needs at least 1 unsignedCall`)
    }
    if (unsignedCalls.length > 10) {
      throw new Error(`unsignedData cannot have more than 10 unsignedCalls`)
    }

    const unsignedData: string = await this.callContractFn(
      'UnsignedDataBuilder',
      `unsignedData(uint8,${'bytes,'.repeat(unsignedCalls.length).slice(0, -1)})`,
      intentIndex,
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

export default new EthereumJsVm()
