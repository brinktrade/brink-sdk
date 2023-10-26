import { TokenArgs, TokenWithDecimalsArgs } from "@brinkninja/types";
import TokenRegistry from "./TokenRegistry";


// Since we can pass a string or a TokenArgs object to the token argument, we need to convert it to a TokenArgs object
// If it's a string, it is assumed to be the address of the token and we build a tokenArgs object with it.
// If it's already a TokenArgs object, we just return it.
export function toTokenArgs(token: string | TokenArgs, chainId: number ) : TokenArgs {
  const registry = TokenRegistry.getInstance();

  if (typeof token === 'string') {
    const tokenDetails = registry.getByAddressOrSymbol(token, chainId)
    return { address: tokenDetails.address }
  } else {
    const tokenDetails = registry.getByTokenArgs(token, chainId)
    return {
      ...token,
      address: tokenDetails.address,
    }
  }
}

export function toTokenWithDecimalsArgs(token: string | TokenArgs, chainId: number ) : TokenWithDecimalsArgs {
  const registry = TokenRegistry.getInstance();

  if (typeof token === 'string') {
    const tokenDetails = registry.getByAddressOrSymbol(token, chainId)
    return { address: tokenDetails.address, decimals: tokenDetails.decimals }
  } else {
    const tokenDetails = registry.getByTokenArgs(token, chainId)
    return {
      ...token,
      address: tokenDetails.address,
      decimals: tokenDetails.decimals,
    }
  }
}
