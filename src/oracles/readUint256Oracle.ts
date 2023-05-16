import { ethers } from 'ethers'
import IUint256OracleAbi from '../internal/contracts/IUint256Oracle.abi'
import { CallData } from '@brinkninja/types'

export type ReadUint256OracleArgs = {
  address: string
  params: string
}

export default async function readUint256Oracle ({
  address,
  params
}: ReadUint256OracleArgs): Promise<CallData> {
  const uint256Oracle = new ethers.Contract(address, IUint256OracleAbi)
  const tx = await uint256Oracle.populateTransaction.getUint256(params)
  return {
    to: tx.to as string,
    data: tx.data as string
  }
}
