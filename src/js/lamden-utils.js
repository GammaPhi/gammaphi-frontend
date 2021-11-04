import BN from 'bignumber.js'
import { get } from "svelte/store";
import { lamdenNetwork, selectedToken  } from '../stores/globalStores'
import { lamden_vk, lamdenCurrencyBalance, lwc, lamdenTokenApprovalAmount } from '../stores/lamdenStores'
import { TransactionResultHandler } from './lamdenTxResultsHandler'

export const start_burn = () => {

}

export async function checkLamdenTokenBalance() {
    let lamdenNetworkInfo = get(lamdenNetwork)
    let token_contract = get(selectedToken).address
    let vk = get(lamden_vk)

    try {
        const res = await fetch(
            `${lamdenNetworkInfo.apiLink}/states/${token_contract}/balances/${vk}`, {
                method: 'GET',
            },
        )
        return await getValueFromResponse(res)
    } catch (error) {
        return new BN(0)
    }
}

export async function checkTokenBalance(token) {
    let lamdenNetworkInfo = get(lamdenNetwork)
    let vk = get(lamden_vk)

    try {
        const res = await fetch(
            `${lamdenNetworkInfo.apiLink}/states/${lamdenNetworkInfo.coins[token].contractName}/balances/${vk}`, {
                method: 'GET',
            },
        )
        return await getValueFromResponse(res)
    } catch (error) {
        return new BN(0)
    }
}

export async function checkLamdenBalance() {
    let lamdenNetworkInfo = get(lamdenNetwork)
    let vk = get(lamden_vk)
    try {
        const res = await fetch(
            `${lamdenNetworkInfo.apiLink}/states/currency/balances/${vk}`, {
                method: 'GET',
            },
        )
        return await getValueFromResponse(res)
    } catch (error) {
        console.log({error})
        return new BN(0)
    }
}

export async function checkLamdenTokenApproval() {
    let lamdenNetworkInfo = get(lamdenNetwork)
    let token = get(selectedToken)
    let token_contract = token.address
    let clearinghouse = token.lamden_clearinghouse
    let vk = get(lamden_vk)

    try {
        const res = await fetch(
            `${lamdenNetworkInfo.apiLink}/states/${token_contract}/balances/${vk}:${clearinghouse}`, {
                method: 'GET',
            },
        ).catch((e) => console.log({e}))
        let value = await getValueFromResponse(res)
        lamdenTokenApprovalAmount.set(value)
    } catch (error) {
        lamdenTokenApprovalAmount.set(new BN(0))
    }
}


export function sendLamdenApproval (resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let token = get(selectedToken)

    let swapInfoStore = get(swapInfo)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.clearingHouse.networkType,
        contractName: token.address,
        methodName: 'approve',
        kwargs: {
            amount: { __fixed__: swapInfoStore.tokenAmount.toString() },
            to: token.lamden_clearinghouse,
        },
        stampLimit: lamdenNetworkInfo.stamps.approval,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}


export function sendCoinFlipApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.coinFlip.networkType,
        contractName: lamdenNetworkInfo.coins.phi.contractName,
        methodName: 'approve',
        kwargs: {
            amount: { __fixed__: amount.toString() },
            to: lamdenNetworkInfo.games.coinFlip.contractName,
        },
        stampLimit: lamdenNetworkInfo.stamps.approval,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}

export function sendCoinFlip (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.coinFlip.networkType,
        contractName: lamdenNetworkInfo.games.coinFlip.contractName,
        methodName: 'flip_phi',
        kwargs: {
            amount: { __fixed__: amount.toString() }
        },
        stampLimit: lamdenNetworkInfo.stamps.coinFlip,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}

function handleTxResults(txResults, resultsTracker, callback){
    if (!txResults.data) 
        resultsTracker.set({loading:false, errors: ["Transaction result unavailable."]})
    else {
        txResults = txResults.data
        let lamdenTxResultsHandler = TransactionResultHandler()
        lamdenTxResultsHandler.parseTxResult(txResults, resultsTracker, callback)
    }
}


async function getValueFromResponse(res){
    if (res.status === 200) {
        let json = await res.json()
        let value = json.value
        if (value) {
            if (value.__fixed__) return new BN(value.__fixed__)
            else return new BN(value)
        } else {
            return new BN(0)
        }
    } else {
        return new BN(0)
    }
}


function hasEnoughTauToSendTx(txName){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let currencyBalance = get(lamdenCurrencyBalance)
    return currencyBalance.isGreaterThan(lamdenNetworkInfo.stamps[txName] / lamdenNetworkInfo.currentStampRatio)
}