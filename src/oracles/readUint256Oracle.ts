import { ethers } from 'ethers'
import IUint256OracleAbi from '../contracts/IUint256Oracle.abi'

export default async function readUint256Oracle (
  signerOrProvider: ethers.providers.Provider | ethers.Signer,
  oracleAddress: string,
  oracleParams: string
): Promise<BigInt> {
  const uint256Oracle = new ethers.Contract(oracleAddress, IUint256OracleAbi, signerOrProvider)
  const res = await uint256Oracle.getUint256(oracleParams)
  return BigInt(res)
}
