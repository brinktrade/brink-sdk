import Config from '../Config'
import { saltedDeployerAddress, accountBytecode } from '.'

const { ACCOUNT_FACTORY } = Config

export type AccountFromSignerArgs = {
  signer: string
}

function accountFromSigner ({
  signer
}: AccountFromSignerArgs): string {
  const { address: account } = saltedDeployerAddress({
    deployerAddress: ACCOUNT_FACTORY,
    salt: '0x',
    bytecode: accountBytecode({ signer }),
    paramTypes: [],
    paramValues: []
  })
  return account
}

export default accountFromSigner
