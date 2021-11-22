import BN from 'bignumber.js'
import { get } from "svelte/store";
import { lamdenNetwork  } from '../stores/globalStores'
import { lamden_vk, walletSelector, lamdenCurrencyBalance, lwc, lamdenTokenApprovalAmount } from '../stores/lamdenStores'
import { TransactionResultHandler } from './lamdenTxResultsHandler'

export const LAMDEN_MOBILE_WALLET_URL = "https://lamdenwallet.com";



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

var popup = null;

function openWalletPopup(url, message, callback) {
    const eventHandler = (event) => {
        if (event.origin !== LAMDEN_MOBILE_WALLET_URL)
            return;
        console.log(event.data);
        console.log("Calling callback");
        callback(event.data);
        window.removeEventListener("message", eventHandler);
    };
    window.addEventListener("message", eventHandler, false);
    if (popup === null || message === null) {
        popup = window.open(
            url,
            "LamdenWallet",
            //"popup"
        );
        if (popup !== null) {
            popup.onbeforeunload = function(){
                popup = null;
            };
        }
    } else {
        console.log("Wallet already open");
        window.postMessage({
            jsonrpc: '2.0',
            ...message
        }, LAMDEN_MOBILE_WALLET_URL);
    }
}

export function loginMobile() {
    var url = (
        LAMDEN_MOBILE_WALLET_URL
        + "?origin=" + encodeURIComponent(window.location.href)
        + "&type=login"
    );
    openWalletPopup(url, null, (data)=>{
        if (data.type && data.type==="vk") {
            let walletController = get(lwc)
            walletController.walletAddress = data.vk;
            walletController.events.emit('newInfo', data);
            return;
        }
    });
}

function sendTransaction(txInfo, resultsTracker, callback) {
    let wallet = get(walletSelector);
    if (wallet==="extension") {
        let walletController = get(lwc)
        walletController.sendTransaction(
            txInfo, 
            (txResults) => handleTxResults(txResults, resultsTracker, callback)
        )
    } else {
        var params = {
            contractName: txInfo.contractName,
            methodName: txInfo.methodName,
            stampLimit: txInfo.stampLimit.toString(),
            kwargs: JSON.stringify(txInfo.kwargs),
            origin: window.location.href,
            type: "sign",
        }
        var url = (
            LAMDEN_MOBILE_WALLET_URL
            + "?contractName=" + encodeURIComponent(params.contractName)
            + "&methodName=" + encodeURIComponent(params.methodName)
            + "&stampLimit=" + encodeURIComponent(params.stampLimit)
            + "&kwargs=" + encodeURIComponent(params.kwargs)
            + "&origin=" + encodeURIComponent(params.origin)
            + "&type=sign"
        );
        console.log(url);
        openWalletPopup(url, params, (data)=>{
            handleTxResults({data: data}, resultsTracker, callback)
        })
    }
}

export function sendPhiPurchaseApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
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

    sendTransaction(txInfo, resultsTracker, callback)
}

export function sendPhiPurchase (amount, round, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)
    let method = (round === 1) ? 'purchase_round_1' : 'purchase_round_2';
    const txInfo = {
        networkType: lamdenNetworkInfo.purchase.networkType,
        contractName: lamdenNetworkInfo.purchase.contractName,
        methodName: method,
        kwargs: {
            amount_tau: { __fixed__: amount.toString() }
        },
        stampLimit: lamdenNetworkInfo.stamps.purchase,
    }

    sendTransaction(txInfo, resultsTracker, callback)
}

export function sendCoinFlipApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)

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

    sendTransaction(txInfo, resultsTracker, callback)
}

export function sendCoinFlip (amount, odds, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)

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

    sendTransaction(txInfo, resultsTracker, callback)
}


export function sendDiceRollApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)

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

    sendTransaction(txInfo, resultsTracker, callback)
}

export function sendDiceRoll (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.diceRoll.networkType,
        contractName: lamdenNetworkInfo.games.diceRoll.contractName,
        methodName: 'roll_dice',
        kwargs: {
            amount: { __fixed__: amount.toString() },
        },
        stampLimit: lamdenNetworkInfo.stamps.diceRoll,
    }

    sendTransaction(txInfo, resultsTracker, callback)
}

export function sendLotteryApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)

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

    sendTransaction(txInfo, resultsTracker, callback)
}

export function sendLottery (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.lottery.networkType,
        contractName: lamdenNetworkInfo.games.lottery.contractName,
        methodName: 'deposit_phi',
        kwargs: {
            amount: parseInt(amount, 10)
        },
        stampLimit: lamdenNetworkInfo.stamps.lottery,
    }

    sendTransaction(txInfo, resultsTracker, callback)
}

export function sendWheelSpinApproval (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)

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

    sendTransaction(txInfo, resultsTracker, callback)
}

export function sendWheelSpin (amount, resultsTracker, callback){
    let lamdenNetworkInfo = get(lamdenNetwork)

    const txInfo = {
        networkType: lamdenNetworkInfo.games.wheelSpin.networkType,
        contractName: lamdenNetworkInfo.games.wheelSpin.contractName,
        methodName: 'spin_wheel',
        kwargs: {
            amount: { __fixed__: amount.toString() },
        },
        stampLimit: lamdenNetworkInfo.stamps.wheelSpin,
    }

    sendTransaction(txInfo, resultsTracker, callback)
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