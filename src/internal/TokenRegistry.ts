import { toBigint, Tokens } from ".";

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
      const normalizedAddress = this.createKey({ value: token.address, chainId: token.chainId });
      const normalizedSymbol = this.createKey({ value: token.symbol, chainId: token.chainId });

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

  getByAddressOrSymbol({ addressOrSymbol, chainId }: { addressOrSymbol: string; chainId: number }): TokenDetails {
    const key = this.createKey({ value: addressOrSymbol, chainId });
    const token = this.addressMap.get(key) || this.symbolMap.get(key);

    if (!token) throw new Error(`Token not found for input "${addressOrSymbol}". Ensure the input is a valid address or symbol.`);

    return {
      address: token.address,
      decimals: token.decimals
    };
  }

  getByTokenArgs({ address, decimals }: { address: string; decimals?: number }, chainId: number): TokenDetails {
    const key = this.createKey({ value: address, chainId });
    const token = this.addressMap.get(key);

    if (!token) {
      if (decimals === undefined) throw new Error(`Token not found for address "${address}" and decimals not provided`);
      return { address, decimals };
    } else if (decimals !== undefined && token.decimals !== Number(decimals)) {
      throw new Error(`Decimals must be ${token.decimals} for the given address. You provided ${decimals}.`);
    } else {
      return {
        address: token.address,
        decimals: token.decimals
      };
    }
  }

  private normalize(value: string): string {
    return value.toLowerCase().trim();
  }

  private createKey({ value, chainId }: {value: string, chainId: number}): string {
    return `${this.normalize(value)}-${chainId}`;
  }
}
