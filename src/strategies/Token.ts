import { TokenStandard, TokenStruct } from './StrategyTypes'

class Token {
  standard: TokenStandard
  addr: string
  idsMerkleRoot: string
  id: BigInt
  disallowFlagged: boolean
  
  public constructor (addr: string)
  public constructor (addr: string, standard: TokenStandard)
  public constructor (
    addr: string,
    standard: TokenStandard,
    idsMerkleRoot: string,
    id: BigInt,
    disallowFlagged: boolean
  )
  public constructor (token: TokenStruct)
  public constructor (...args: any[]) {
    this.addr = '0x0000000000000000000000000000000000000000'
    this.standard = TokenStandard.ERC20
    this.idsMerkleRoot = '0x0000000000000000000000000000000000000000000000000000000000000000'
    this.id = BigInt(0)
    this.disallowFlagged = false

    if (args.length == 1 && typeof args[0] === 'string') {
      this.addr = args[0]
    } else if (args.length == 1) {
      const tokenStruct = args[0]
      this.addr = tokenStruct.addr
      this.standard = tokenStruct.standard
      this.idsMerkleRoot = tokenStruct.idsMerkleRoot
      this.id = tokenStruct.id
      this.disallowFlagged = tokenStruct.disallowFlagged
    } else if (args.length == 2) {
      this.addr = args[0]
      this.standard = args[1]
    } else if (args.length == 5) {
      this.addr = args[0]
      this.standard = args[1]
      this.idsMerkleRoot = args[2]
      this.id = args[3]
      this.disallowFlagged = args[4]
    }
  }

  public toJSON(): {
    addr: string,
    standard: TokenStandard,
    idsMerkleRoot: string,
    id: string,
    disallowFlagged: boolean
  } {
    return {
      addr: this.addr,
      standard: this.standard,
      idsMerkleRoot: this.idsMerkleRoot,
      id: this.id.toString(),
      disallowFlagged: this.disallowFlagged
    }
  }

}

export default Token
