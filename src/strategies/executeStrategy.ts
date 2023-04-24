import { ethers } from 'ethers'
import SignedStrategy from "./SignedStrategy"

export type ExecuteStrategyResult = {
  success: boolean,
  calldata?: string
}

export interface ExecuteStrategyArgs {
  signer: ethers.Signer,
  strategy: SignedStrategy,
  orderIndex: number,
  callData: string
}

export default async function executeStrategy ({
  signer,
  strategy,
  orderIndex,
  callData
}: ExecuteStrategyArgs): Promise<ExecuteStrategyResult> {
  return { success: true }
}
