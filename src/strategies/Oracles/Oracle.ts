abstract class Oracle {

  contractAddress: string
  paramsEncoded: string

  constructor (contractAddress: string, paramsEncoded: string) {
    this.contractAddress = contractAddress
    this.paramsEncoded = paramsEncoded
  }

}

export default Oracle
