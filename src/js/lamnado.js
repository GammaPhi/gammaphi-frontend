
import { sendTransaction } from './lamden-utils'
import { lamdenNetwork } from '../stores/globalStores'
import circomlib from 'circomlib'
import { get } from 'svelte/store'
import { bigInt } from 'snarkjs'
import crypto from 'crypto'


/** Generate random number of specified byte length */
const rbigint = (nbytes) => bigInt.leBuff2int(crypto.randomBytes(nbytes))

/** Compute pedersen hash */
const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]

/** BigNumber to hex string of specified length */
export const toHex = (number, length = 32) =>
  '0x' +
  (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0')


/**
 * Create deposit object from secret and nullifier
 */
function createDeposit(nullifier, secret) {
    let deposit = { nullifier, secret }
    deposit.preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)])
    deposit.commitment = pedersenHash(deposit.preimage)
    deposit.nullifierHash = pedersenHash(deposit.nullifier.leInt2Buff(31))
    return deposit
}


/**
 * Create a random deposit object
 */
export function createRandomDeposit() {
    return createDeposit(rbigint(31), rbigint(31))
}


/** 
 * Return note from given data
 */
export function createNote(amount, token, deposit) {
    return `lamnado-${token}-${amount}-${toHex(deposit.preimage)}`
}


/**
 * Callback is called with a note and the result of the lamden transaction
 */
export function lamnadoDeposit(amount, token, deposit, resultsTracker, callback) {
    const lamdenNetworkInfo = get(lamdenNetwork)
    const contract = lamdenNetworkInfo.lamnado_contracts[token][amount];

    // make sure contract is valid
    if (!contract) {
        throw Error(`No contract exists for ${token} with denomination ${amount}`)
    }

    // prepare transaction
    const commitment = toHex(deposit.commitment)
    const txInfo = {
        networkType: lamdenNetworkInfo.networkType,
        contractName: contract,
        methodName: 'deposit',
        kwargs: {
            commitment: commitment,
        },
        stampLimit: lamdenNetworkInfo.stamps.lamnado_deposit,
    }

    sendTransaction(txInfo, resultsTracker, (result) => {
        // create private note for user
        const note = createNote(amount, token, deposit)
        callback({
            result: result,
            note: note
        })  
    })    
}


/**
 * Send an async request to a relayer to withdraw funds
 */
export async function lamnadoWithdraw(relayer_url, note, recipient) {
    // extract data from note
    const noteSplit = note.split('-')

    // prepare POST
    const body = {
        token: noteSplit[1],
        denomination: noteSplit[2],
        note: noteSplit[3],
        recipient: recipient,
    }

    // check if nullifier has already been spent
    // TODO

    // send request to relayer
    const res = await fetch(
        `${relayer_url}/relay`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        },
    )
    if (res.status === 200) {
        let json = await res.json()
        return json
    } else {
        throw Error("Withdraw request returned a non 200 status code.")
    }
}


/**
 * Utility function to approve a token contract
 */

 export function sendTokenApproval (amount, contract, resultsTracker, callback) {
    let lamdenNetworkInfo = get(lamdenNetwork)
    const txInfo = {
        networkType: lamdenNetworkInfo.networkType,
        contractName: contract,
        methodName: 'approve',
        kwargs: {
            amount: { __fixed__: amount.toString() },
            to: amount,
        },
        stampLimit: lamdenNetworkInfo.stamps.approval,
    }

    sendTransaction(txInfo, resultsTracker, callback)
}