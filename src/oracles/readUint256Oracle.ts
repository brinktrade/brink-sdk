import { ethers } from 'ethers'
import IUint256OracleAbi from '../internal/contracts/IUint256Oracle.abi'
import { CallData } from '../Types'

export type ReadUint256OracleArgs = {
  oracleAddress: string
  oracleParams: string
}

export default async function readUint256Oracle ({
  oracleAddress,
  oracleParams
}: ReadUint256OracleArgs): Promise<CallData> {
  const uint256Oracle = new ethers.Contract(oracleAddress, IUint256OracleAbi)
  const tx = await uint256Oracle.populateTransaction.getUint256(oracleParams)
  return {
    to: tx.to as string,
    data: tx.data as string
  }
}
