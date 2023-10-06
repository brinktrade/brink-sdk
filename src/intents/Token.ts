import { TokenArgs, TokenStandard, TokenStruct, TokenJSON } from '@brinkninja/types'
import { JsonStructBuilder } from './JsonStructBuilder'

class Token implements JsonStructBuilder<TokenStruct, TokenJSON> {
  address: string
  standard: TokenStandard
  idsMerkleRoot: string
  id: bigint
  disallowFlagged: boolean

  public constructor (args: TokenArgs) {
    this.address = args.address
    this.standard = args.standard || TokenStandard.ERC20
    this.idsMerkleRoot = args.idsMerkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000'
    this.id = BigInt(args?.id || 0)
    this.disallowFlagged = args.disallowFlagged || false
  }

  public toStruct(): TokenStruct {
    return {
      addr: this.address,
      standard: this.standard,
      idsMerkleRoot: this.idsMerkleRoot,
      id: this.id,
      disallowFlagged: this.disallowFlagged
    }
  }

  public toJSON(): TokenJSON {
    return {
      address: this.address,
      standard: this.standard,
      idsMerkleRoot: this.idsMerkleRoot,
      id: this.id.toString(),
      disallowFlagged: this.disallowFlagged
    }
  }

}

export default Token