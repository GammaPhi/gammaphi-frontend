import { writable, derived } from "svelte/store";
import BN from 'bignumber.js'

export const lwc = writable(null)
export const lamden_vk = writable(null)
export const lamdenWalletInfo = writable({})
export const hasNetworkApproval = writable({})
export const lamdenCurrencyBalance = writable(new BN(0))
export const lamdenTokenBalance = writable(new BN(0))
export const phiCurrencyBalance = writable(new BN(0))
export const lamdenTokenApprovalAmount = writable(new BN(0))

// Coin Flip 
export const coinFlipInputValue = writable(new BN(0))
export const coinFlipApprovalTxStatus = writable({})
export const coinFlipTxStatus = writable({})

// Purchase PHI
export const purchasePhiInputValue = writable(new BN(0))
export const lamdenApprovalTxStatus = writable({})
export const purchasePhiTxStatus = writable({})

// Lottery 
export const lotteryInputValue = writable(new BN(0))
export const lotteryApprovalTxStatus = writable({})
export const lotteryTxStatus = writable({})
export const lotteryBalance = writable(new BN(0))

// Wheel Spin
export const wheelSpinInputValue = writable(new BN(0))
export const wheelSpinApprovalTxStatus = writable({})
export const wheelSpinTxStatus = writable({})
