import { TokenArgs } from "@brinkninja/types";

// Since we can pass a string or a TokenArgs object to the token argument, we need to convert it to a TokenArgs object
// If it's a string, it is assumed to be the address of the token and we build a tokenArgs object with it.
// If it's already a TokenArgs object, we just return it.
export default function toTokenArgs(token: string | TokenArgs ) : TokenArgs {
  return typeof token === 'string' ? {address: token} : token
}
