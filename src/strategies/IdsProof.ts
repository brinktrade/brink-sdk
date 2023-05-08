import { IdsProofStruct } from '../Types'

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
  public constructor (...args: IdsProofArgs[]) {
    if (args.length == 0) {
      this.ids = []
      this.merkleProof_hashes = []
      this.merkleProof_flags = []
      this.statusProof_lastTransferTimes = []
      this.statusProof_timestamps = []
      this.statusProof_signatures = []
    } else {
      this.ids = args[0].ids || []
      this.merkleProof_hashes = args[0].merkleProof_hashes || []
      this.merkleProof_flags = args[0].merkleProof_flags || []
      this.statusProof_lastTransferTimes = args[0].statusProof_lastTransferTimes || []
      this.statusProof_timestamps = args[0].statusProof_timestamps || []
      this.statusProof_signatures = args[0].statusProof_signatures || []
    }
  }

  public toJSON(): IdsProofStruct {
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
