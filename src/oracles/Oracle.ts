export type OracleConstructorArgs = {
  address: string
  params: string
}

abstract class Oracle {

  address: string
  params: string

  constructor ({
    address,
    params
  }: OracleConstructorArgs) {
    this.address = address
    this.params = params
  }

}

export default Oracle
