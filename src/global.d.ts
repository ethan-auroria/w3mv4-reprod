import type { WalletClient } from "viem";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";

type WagmiConfig = ReturnType<typeof defaultWagmiConfig>;
type W3M = ReturnType<typeof createWeb3Modal>;

declare interface Window {
  globalWagmi: WagmiConfig;
  globalW3m: W3M;
  globalWalletClient?: WalletClient;
}
