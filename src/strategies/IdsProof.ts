import { IdsProofStruct, IdsProofJSON, BigIntish } from '@brinkninja/types'

export interface IdsProofArgs {
  ids?: BigIntish[],
  merkleProof_hashes?: string[],
  merkleProof_flags?: boolean[],
  statusProof_lastTransferTimes?: BigIntish[],
  statusProof_timestamps?: BigIntish[],
  statusProof_signatures?: string[]
}

class IdsProof {
  ids: BigInt[]
  merkleProof_hashes: string[]
  merkleProof_flags: boolean[]
  statusProof_lastTransferTimes: BigInt[]
  statusProof_timestamps: BigInt[]
  statusProof_signatures: string[];

  public constructor()
  public constructor (args: IdsProofArgs)
  public constructor (...arr: any[]) {
    const args: IdsProofArgs = arr[0] || {}
    this.ids = mapBigIntishArray(args?.ids || [])
    this.merkleProof_hashes = args?.merkleProof_hashes || []
    this.merkleProof_flags = args?.merkleProof_flags || []
    this.statusProof_lastTransferTimes = mapBigIntishArray(args?.statusProof_lastTransferTimes || [])
    this.statusProof_timestamps = mapBigIntishArray(args?.statusProof_timestamps || [])
    this.statusProof_signatures = args?.statusProof_signatures || []
  }

  public toJSON(): IdsProofJSON {
    return this.toStruct()
  }

  public toStruct(): IdsProofStruct {
    return {
      ids: mapBigIntArray(this.ids),
      merkleProof_hashes: this.merkleProof_hashes,
      merkleProof_flags: this.merkleProof_flags,
      statusProof_lastTransferTimes: mapBigIntArray(this.statusProof_lastTransferTimes),
      statusProof_timestamps: mapBigIntArray(this.statusProof_timestamps),
      statusProof_signatures: this.statusProof_signatures
    }
  }

}

function mapBigIntishArray (arr: BigIntish[]): BigInt[] {
  return arr.map((item: BigIntish) => BigInt(item))
}

function mapBigIntArray (arr: BigInt[]): bigint[] {
  return arr.map((item: BigInt) => BigInt(item.toString()))
}

export default IdsProof
