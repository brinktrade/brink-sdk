type TokenInput = {
  address: string;
  decimals?: number;
}

type TokenMetadata = {
  address: string;
  symbol: string;
  decimals: number;
};

type TokenReturn = {
  address: string;
  decimals: number;
};

export class TokenRegistry {
  private addressMap: Map<string, TokenMetadata>;
  private symbolMap: Map<string, TokenMetadata>;

  constructor(tokens: TokenMetadata[]) {
    this.addressMap = new Map();
    this.symbolMap = new Map();

    for (const token of tokens) {
      const normalizedAddress = token.address.toLowerCase();
      const normalizedSymbol = token.symbol.toLowerCase();

      this.addressMap.set(normalizedAddress, token);
      this.symbolMap.set(normalizedSymbol, token);
    }
  }

  get(input: string | TokenInput): TokenReturn {
    if (typeof input === 'string') {
      return this.getByString(input);
    } else {
      return this.getByTokenArgs(input);
    }
  }

  private getByString(input: string): TokenReturn {
    const normalizedInput = input.toLowerCase();
    const token = this.addressMap.get(normalizedInput) || this.symbolMap.get(normalizedInput);

    if (!token) throw new Error(`Token not found for input "${input}". Ensure the input is a valid address or symbol.`);

    return {
      address: token.address,
      decimals: token.decimals
    };
  }

  private getByTokenArgs({ address, decimals }: TokenInput): TokenReturn {
    const normalizedAddress = address.toLowerCase();
    const token = this.addressMap.get(normalizedAddress);

    if (!token) {
      if (decimals === undefined) throw new Error('Token not found and decimals not provided');
      return { address, decimals };
    } else if (decimals !== undefined && token.decimals !== decimals) {
      throw new Error(`decimals must be ${token.decimals} for the given address`);
    } else {
      return {
        address: token.address,
        decimals: token.decimals
      };
    }
  }
}
