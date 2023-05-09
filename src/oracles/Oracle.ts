export type OracleConstructorArgs = {
  contractAddress: string
  paramsEncoded: string
}

abstract class Oracle {

  contractAddress: string
  paramsEncoded: string

  constructor ({
    contractAddress,
    paramsEncoded
  }: OracleConstructorArgs) {
    this.contractAddress = contractAddress
    this.paramsEncoded = paramsEncoded
  }

}

export default Oracle
