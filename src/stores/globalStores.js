import { writable, derived } from "svelte/store";
import * as networks from '../js/networks'

export const selectedNetwork =  writable("testnet") // writable("mainnet")

export const selectedToken = writable("DTAU")
export const networkInfo = derived(selectedNetwork, ($selectedNetwork) => networks[$selectedNetwork])
export const lamdenNetwork = derived(networkInfo, ($networkInfo) => $networkInfo.lamden)
