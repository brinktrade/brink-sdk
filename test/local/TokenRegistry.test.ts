import { TokenRegistry } from '@brink-sdk/intents/TokenRegistry'
import { expect } from 'chai'

describe('TokenRegistry', () => {
  let tokenRegistry: TokenRegistry;
  beforeEach(() => {
    tokenRegistry = new TokenRegistry(JSON.parse(rawTokenJson));
  });

  it('retrieves token details when a symbol is provided', () => {
    const result = tokenRegistry.get("AAVE");
    expect(result.address).to.equal("0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9");
    expect(result.decimals).to.equal(18);
  });

  it('retrieves token details when an address is provided', () => {
    const inputAddress = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
    const result = tokenRegistry.get(inputAddress);
    expect(result.address).to.equal(inputAddress);
    expect(result.decimals).to.equal(18);
  });

  it('does not require decimals if token address from list is provided', () => {
    const result = tokenRegistry.get({ address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" });
    expect(result.decimals).to.equal(18);
  });

  it('throws error if provided decimals do not match metadata for token in list', () => {
    const input = {
      address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      decimals: 17
    };
    expect(() => tokenRegistry.get(input)).to.throw('decimals must be 18 for the given address');
  });

  it('uses decimals from list if not provided in TokenInput and token is on the list', () => {
    const input = { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" };
    const result = tokenRegistry.get(input);
    expect(result.decimals).to.equal(18);
  });

  // Negative scenarios or edge cases:
  it('throws error for unrecognized token symbol', () => {
    expect(() => tokenRegistry.get("UNRECOGNIZED")).to.throw(`Token not found for input "UNRECOGNIZED"`);
  });

  it('throws error for unrecognized token address without decimals', () => {
    expect(() => tokenRegistry.get({ address: "0xUnrecognizedAddress" })).to.throw('Token not found and decimals not provided');
  });
});

const rawTokenJson = `[
    {
      "chainId": 1,
      "address": "0x111111111117dC0aa78b770fA6A738034120C302",
      "name": "1inch",
      "symbol": "1INCH",
      "decimals": 19,
      "logoURI": "https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028",
      "extensions": {
        "bridgeInfo": {
          "10": {
            "tokenAddress": "0xAd42D013ac31486B73b6b059e748172994736426"
          },
          "56": {
            "tokenAddress": "0x111111111117dC0aa78b770fA6A738034120C302"
          },
          "137": {
            "tokenAddress": "0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f"
          },
          "8453": {
            "tokenAddress": "0xc5fecC3a29Fb57B5024eEc8a2239d4621e111CBE"
          },
          "42161": {
            "tokenAddress": "0x6314C31A7a1652cE482cffe247E9CB7c3f4BB9aF"
          },
          "43114": {
            "tokenAddress": "0xd501281565bf7789224523144Fe5D98e8B28f267"
          }
        }
      }
    },
    {
      "chainId": 1,
      "address": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      "name": "Aave",
      "symbol": "AAVE",
      "decimals": 18,
      "logoURI": "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png?1601374110",
      "extensions": {
        "bridgeInfo": {
          "10": {
            "tokenAddress": "0x76FB31fb4af56892A25e32cFC43De717950c9278"
          },
          "56": {
            "tokenAddress": "0xfb6115445Bff7b52FeB98650C87f44907E58f802"
          },
          "137": {
            "tokenAddress": "0xD6DF932A45C0f255f85145f286eA0b292B21C90B"
          },
          "42161": {
            "tokenAddress": "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196"
          },
          "43114": {
            "tokenAddress": "0x63a72806098Bd3D9520cC43356dD78afe5D386D9"
          }
        }
      }
    }
  ]
`
