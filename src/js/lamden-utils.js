import BN from 'bignumber.js'
import { get } from "svelte/store";
import { lamdenNetwork  } from '../stores/globalStores'
import { lamden_vk, lamdenCurrencyBalance, lwc, lamdenTokenApprovalAmount } from '../stores/lamdenStores'
import { TransactionResultHandler } from './lamdenTxResultsHandler'


export async function checkContractVariable(contract, variableName) {
    let lamdenNetworkInfo = get(lamdenNetwork)
    try {
        const res = await fetch(
            `${lamdenNetworkInfo.masterNodeLink}/contracts/${contract}/${variableName}`, {
                method: 'GET',
            },
        )
        return await getValueFromResponse(res)
    } catch (error) {
        return new BN(0)
    }
}

export async function checkLotteryTotal() {
    let lamdenNetworkInfo = get(lamdenNetwork)
    try {
        const res = await fetch(
            `${lamdenNetworkInfo.masterNodeLink}/contracts/${lamdenNetworkInfo.games.lottery.contractName}/total`, {
                method: 'GET',
            },
        )
        return await getValueFromResponse(res)
    } catch (error) {
        return new BN(0)
    }
}

export async function getLotteryBalance() {
    let lamdenNetworkInfo = get(lamdenNetwork)
    let vk = get(lamden_vk)
    try {
        const res = await fetch(
            `${lamdenNetworkInfo.masterNodeLink}/contracts/${lamdenNetworkInfo.games.lottery.contractName}/balances?key=${vk}`, {
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

export async function checkHousePHIBalance() {
    let lamdenNetworkInfo = get(lamdenNetwork)
    try {
        const res = await fetch(
            `${lamdenNetworkInfo.masterNodeLink}/contracts/${lamdenNetworkInfo.coins.phi.contractName}/balances?key=${lamdenNetworkInfo.games.coinFlip.contractName}`, {
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

export function sendPhiPurchaseApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.purchase.networkType,
        contractName: 'currency',
        methodName: 'approve',
        kwargs: {
            amount: { __fixed__: amount.toString() },
            to: lamdenNetworkInfo.purchase.contractName,
        },
        stampLimit: lamdenNetworkInfo.stamps.approval,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}

export function sendPhiPurchase (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.purchase.networkType,
        contractName: lamdenNetworkInfo.purchase.contractName,
        methodName: 'purchase_round_1',
        kwargs: {
            amount_tau: { __fixed__: amount.toString() }
        },
        stampLimit: lamdenNetworkInfo.stamps.purchase,
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

export function sendCoinFlip (amount, odds, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.coinFlip.networkType,
        contractName: lamdenNetworkInfo.games.coinFlip.contractName,
        methodName: 'flip_phi',
        kwargs: {
            amount: { __fixed__: amount.toString() },
            odds: { __fixed__: odds.toString() },
        },
        stampLimit: lamdenNetworkInfo.stamps.coinFlip,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}


export function sendDiceRollApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.diceRoll.networkType,
        contractName: lamdenNetworkInfo.coins.phi.contractName,
        methodName: 'approve',
        kwargs: {
            amount: { __fixed__: amount.toString() },
            to: lamdenNetworkInfo.games.diceRoll.contractName,
        },
        stampLimit: lamdenNetworkInfo.stamps.approval,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}

export function sendDiceRoll (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.diceRoll.networkType,
        contractName: lamdenNetworkInfo.games.diceRoll.contractName,
        methodName: 'roll_dice',
        kwargs: {
            amount: { __fixed__: amount.toString() },
        },
        stampLimit: lamdenNetworkInfo.stamps.diceRoll,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}

export function sendLotteryApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.lottery.networkType,
        contractName: lamdenNetworkInfo.coins.phi.contractName,
        methodName: 'approve',
        kwargs: {
            amount: { __fixed__: amount.toString() },
            to: lamdenNetworkInfo.games.lottery.contractName,
        },
        stampLimit: lamdenNetworkInfo.stamps.approval,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}

export function sendLottery (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.lottery.networkType,
        contractName: lamdenNetworkInfo.games.lottery.contractName,
        methodName: 'deposit_phi',
        kwargs: {
            amount: parseInt(amount, 10)
        },
        stampLimit: lamdenNetworkInfo.stamps.lottery,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}

export function sendWheelSpinApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.wheelSpin.networkType,
        contractName: lamdenNetworkInfo.coins.phi.contractName,
        methodName: 'approve',
        kwargs: {
            amount: { __fixed__: amount.toString() },
            to: lamdenNetworkInfo.games.wheelSpin.contractName,
        },
        stampLimit: lamdenNetworkInfo.stamps.approval,
    }

    walletController.sendTransaction(txInfo, (txResults) => handleTxResults(txResults, resultsTracker, callback))
}

export function sendWheelSpin (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let walletController = get(lwc)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.wheelSpin.networkType,
        contractName: lamdenNetworkInfo.games.wheelSpin.contractName,
        methodName: 'spin_wheel',
        kwargs: {
            amount: { __fixed__: amount.toString() },
        },
        stampLimit: lamdenNetworkInfo.stamps.wheelSpin,
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