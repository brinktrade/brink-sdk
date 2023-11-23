import { TokenRegistry } from "@brink-sdk/internal";

const registry = TokenRegistry.getInstance();

export const USDC_TOKEN = registry.getByAddressOrSymbol({ addressOrSymbol: "USDC", chainId: 1 });
export const DAI_TOKEN =  registry.getByAddressOrSymbol({ addressOrSymbol: "DAI", chainId: 1 });
export const WETH_TOKEN = registry.getByAddressOrSymbol({ addressOrSymbol: "WETH", chainId: 1 });
