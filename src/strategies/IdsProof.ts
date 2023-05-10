import { IdsProofStruct, IdsProofJSON } from '../Types'

export interface IdsProofArgs {
  ids?: BigInt[],
  merkleProof_hashes?: string[],
  merkleProof_flags?: boolean[],
  statusProof_lastTransferTimes?: BigInt[],
  statusProof_timestamps?: BigInt[],
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
    this.ids = args?.ids || []
    this.merkleProof_hashes = args?.merkleProof_hashes || []
    this.merkleProof_flags = args?.merkleProof_flags || []
    this.statusProof_lastTransferTimes = args?.statusProof_lastTransferTimes || []
    this.statusProof_timestamps = args?.statusProof_timestamps || []
    this.statusProof_signatures = args?.statusProof_signatures || []
  }

  public toJSON(): IdsProofJSON {
    return this.toStruct()
  }

  public toStruct(): IdsProofStruct {
    return {
      ids: this.ids,
      merkleProof_hashes: this.merkleProof_hashes,
      merkleProof_flags: this.merkleProof_flags,
      statusProof_lastTransferTimes: this.statusProof_lastTransferTimes,
      statusProof_timestamps: this.statusProof_timestamps,
      statusProof_signatures: this.statusProof_signatures
    }
  }

}

export default IdsProof
