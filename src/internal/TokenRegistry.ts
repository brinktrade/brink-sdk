import { Tokens } from ".";

type TokenMetadata = {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
};

type TokenDetails = {
  address: string;
  decimals: number;
};

export default class TokenRegistry {
  private static instance: TokenRegistry;

  private addressMap: Map<string, TokenMetadata>;
  private symbolMap: Map<string, TokenMetadata>;

  constructor(tokens: TokenMetadata[]) {
    this.addressMap = new Map();
    this.symbolMap = new Map();

    for (const token of tokens) {
      const normalizedAddress = this.createKey(token.address, token.chainId);
      const normalizedSymbol = this.createKey(token.symbol, token.chainId);

      this.addressMap.set(normalizedAddress, token);
      this.symbolMap.set(normalizedSymbol, token);
    }
  }

  static getInstance(): TokenRegistry {
    if (!TokenRegistry.instance) {
      const tokens: TokenMetadata[] = Tokens.tokens
      TokenRegistry.instance = new TokenRegistry(tokens);
    }
    return TokenRegistry.instance;
  }

  private normalize(value: string): string {
    return value.toLowerCase().trim();
  }

  private createKey(value: string, chainId: number): string {
    return `${this.normalize(value)}-${chainId}`;
  }

  getByAddressOrSymbol(addressOrSymBol: string, chainId: number): TokenDetails {
    const key = this.createKey(addressOrSymBol, chainId);
    const token = this.addressMap.get(key) || this.symbolMap.get(key);

    if (!token) throw new Error(`Token not found for input "${addressOrSymBol}". Ensure the input is a valid address or symbol.`);

    return {
      address: token.address,
      decimals: token.decimals
    };
  }

  getByTokenArgs({ address, decimals }: { address: string; decimals?: number }, chainId: number): TokenDetails {
    const key = this.createKey(address, chainId);
    const token = this.addressMap.get(key);

    if (!token) {
      if (decimals === undefined) throw new Error(`Token not found for address "${address}" and decimals not provided`);
      return { address, decimals };
    } else if (decimals !== undefined && token.decimals !== decimals) {
      throw new Error(`Decimals must be ${token.decimals} for the given address. You provided ${decimals}.`);
    } else {
      return {
        address: token.address,
        decimals: token.decimals
      };
    }
  }
}
