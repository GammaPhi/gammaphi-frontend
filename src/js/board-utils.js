import { sendBoardGameApproval, sendBoardGameTransaction } from './lamden-utils';
import { get } from 'svelte/store'

export const NUM_ROWS = 8;
export const NUM_COLS = 8;

export const formatBoard = (board, team) => {
    let array = [];
    for(let i = 0; i < NUM_ROWS; i++) {
        let row = board.substring(i*NUM_ROWS, i*NUM_ROWS+NUM_COLS).split('');
        if (team === 'b') {
            row.reverse();
        }
        array.push(row);        
    }
    if (team === 'b') {
        array.reverse();
    }
    return array;
}

export const coordsToIndex = (row, col) => {
    return row * NUM_ROWS + col;
}

export const indexToCoords = (index) => {
    return [Math.floor(index / NUM_ROWS), index % NUM_COLS];
}

export function sendApprovalHelper(amount, handler, errors, inProgress, callback) {
    sendBoardGameApproval(amount, handler, (txResults)=>{
        if (get(handler).errors?.length > 0) {
            errors.set(get(handler).errors)
            inProgress.set(false);
        } else {
            console.log("Success");
            console.log(txResults);
            callback();
        }
    })
}

export function payUpHelper(game_id, game_type, handler, errors, inProgress) {
    txnHelper('pay_up', game_id, game_type, handler, errors, inProgress)
}

export function requestEndHelper(game_id, game_type, handler, errors, inProgress) {
    txnHelper('request_end', game_id, game_type, handler, errors, inProgress)
}

export function acceptEndHelper(game_id, game_type, handler, errors, inProgress) {
    txnHelper('accept_end', game_id, game_type, handler, errors, inProgress)
}

export function forfeitRoundHelper(game_id, game_type, handler, errors, inProgress) {
    txnHelper('forfeit_round', game_id, game_type, handler, errors, inProgress)
}

export function nextRoundHelper(game_id, game_type, handler, errors, inProgress) {
    txnHelper('next_round', game_id, game_type, handler, errors, inProgress)
}

export function joinHelper(game_id, game_type, handler, errors, inProgress) {
    txnHelper('join', game_id, game_type, handler, errors, inProgress)
}

export function playAgainHelper(game_id, game_type, handler, errors, inProgress) {
    txnHelper('play_again', game_id, game_type, handler, errors, inProgress)
}

export function earlyEndHelper(game_id, game_type, handler, errors, inProgress) {
    txnHelper('early_end', game_id, game_type, handler, errors, inProgress)
}


function txnHelper(action, game_id, game_type, handler, errors, inProgress) {
    errors.set([]);
    inProgress.set(true);
    sendBoardGameTransaction(
        "games",
        {
            action: action,
            type: game_type,
            game_id: game_id,
        }, handler, (txResults)=>{
            inProgress.set(false);
            if (get(handler).errors?.length > 0) {
                errors.set(get(handler).errors)
            } else {
                console.log("Success");
                console.log(txResults);
            }
    })
}