import Config from '../Config'

const { ACCOUNT } = Config

export type AccountBytecodeArgs = {
  signer: string
}

function accountBytecode ({
  signer
}: AccountBytecodeArgs): string {
  return '603c3d8160093d39f33d3d3d3d363d3d37363d6f'
    + removeLeadingZeros(ACCOUNT.slice(2)).toLowerCase()
    + '5af43d3d93803e602657fd5bf3'
    + signer.slice(2).toLowerCase()
}

const removeLeadingZeros = (s: string) => s.replace(/^0+/, '')

export default accountBytecode
