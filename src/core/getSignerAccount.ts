import Config from '../Config'
import { saltedDeployerAddress, accountBytecode } from '.'

const { ACCOUNT_FACTORY } = Config

export type GetSignerAccountArgs = {
  signer: string
}

function getSignerAccount ({
  signer
}: GetSignerAccountArgs): string {
  const { address: account } = saltedDeployerAddress({
    deployerAddress: ACCOUNT_FACTORY,
    salt: '0x',
    bytecode: accountBytecode({ signer }),
    paramTypes: [],
    paramValues: []
  })
  return account
}

export default getSignerAccount
