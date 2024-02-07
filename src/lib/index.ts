// place files you want to import through the `$lib` alias in this folder.
import { PUBLIC_WALLETCONNECT_PROJECT_ID } from "$env/static/public";
import { dev } from "$app/environment";
import { writable } from "svelte/store";

import { zeroAddress, type WalletClient } from "viem";
import { mainnet, sepolia, localhost, holesky } from "@wagmi/core/chains";
import type { GetAccountReturnType, GetChainIdReturnType } from "@wagmi/core";
import {
  reconnect,
  getAccount,
  getWalletClient,
  watchAccount,
  watchChainId,
} from "@wagmi/core";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";

export const showLoading = writable(false);
export const showAcceptTransaction = writable(false);
export const showPendingTransaction = writable(false);

type WagmiConfig = ReturnType<typeof defaultWagmiConfig>;
type W3M = ReturnType<typeof createWeb3Modal>;

type WalletGlobalState = {
  modal: W3M;
  isConnected: boolean;
  isChainSupported: boolean;
  // activeChain: Chain | undefined;
  activeAddress: WalletAddress;
  activeWallet?: WalletClient;
};

// Creates a svelte store that keeps track of wagmi & web3modal.
export function createW3ModalStore() {
  const chains = [mainnet, holesky, localhost, sepolia] as const; // without as const the type check fails
  const chainIds: number[] = chains.map((c) => c.id);
  const projectId = PUBLIC_WALLETCONNECT_PROJECT_ID;
  const metadata = {
    name: "Reprod",
    description: "Reprod",
    url: "https://something.com",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };

  // all the window.* variables are defined in `global.d.ts`.
  const hasExistingInstance = window.globalWagmi != null;

  const wagmiConfig: WagmiConfig = window.globalWagmi
    ? window.globalWagmi
    : defaultWagmiConfig({ chains, projectId, metadata });
  // reconnect(wagmiConfig); // this is new in v4

  const modal: W3M = window.globalW3m
    ? window.globalW3m
    : createWeb3Modal({ wagmiConfig, projectId });

  if (!hasExistingInstance) {
    window.globalWagmi = wagmiConfig;
    window.globalW3m = modal;
  }

  const acc = getAccount(wagmiConfig);

  const { subscribe, update } = writable<WalletGlobalState>({
    modal,
    isConnected: acc.isConnected,
    isChainSupported: acc.isConnected ? chainIds.includes(acc.chainId) : false,
    activeAddress: acc.address ?? zeroAddress,
    activeWallet: window.globalWalletClient,
  });

  function onChainIdChanged(
    id: GetChainIdReturnType,
    prev: GetChainIdReturnType,
  ) {
    if (dev) {
      console.log("GLOBAL W3M - Chain ID changed (id, prev) =", id, prev);
    }

    update((s) => {
      s.isChainSupported = chainIds.includes(id);
      return s;
    });
  }

  function onAccountChanged(
    account: GetAccountReturnType,
    prev: GetAccountReturnType,
  ) {
    if (dev) {
      console.log("global w3m - account changed", acc);
    }

    update((s) => {
      s.activeAddress = account.address ?? zeroAddress;
      s.isConnected = account.address !== undefined && account.isConnected;
      return s;
    });
  }

  let unwatchChainId: () => void;
  let unwatchAccount: () => void;

  if (!hasExistingInstance) {
    console.warn("Registering w3m listeners");
    unwatchChainId = watchChainId(wagmiConfig, { onChange: onChainIdChanged });
    unwatchAccount = watchAccount(wagmiConfig, { onChange: onAccountChanged });
  }

  const unwatch = async () => {
    if (unwatchChainId) unwatchChainId();
    if (unwatchAccount) unwatchAccount();
  };

  const open = () => {
    // if (modal)
    modal.open();
  };

  return {
    subscribe,
    unwatch,
    open,
  };
}

export const w3m = createW3ModalStore();
