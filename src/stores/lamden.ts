import { writable, derived } from "svelte/store";
import BN from 'bignumber.js'

export const lamdenWalletInfo = writable(undefined);
export const tauBalance = writable(new BN(0));
export const ethBalance = writable(new BN(0));
export const currentNetwork = writable('testnet'); //writable('mainnet');
export const lamden_origin = writable(false)
export const skipped = writable(false)
export const inputValue = writable(null)
export const token_selected = writable(null)
export const tokenBalance = writable(null)
export const popup_modal = writable(null)
export const eth_token_balance = writable(null)
export const lamden_token_balance = writable(null)
export const swap_details = writable(null)
export const swap_finished = writable(false)
export const checkTokenBalanceFunction = writable(null)
export const lwc_installed = writable(false)
export const lwc = writable(null)
export const connected_lwc = writable(false)
export const vk = derived(lamdenWalletInfo, ($lamdenWalletInfo) => {
  if (
    $lamdenWalletInfo &&
    $lamdenWalletInfo.wallets &&
    $lamdenWalletInfo.wallets.length > 0
  ) {
    return $lamdenWalletInfo.wallets[0];
  } else {
    return undefined;
  }
});

export const message = writable("")
export const success = writable("")
export const status = writable("")
export const isLoading = writable(false)