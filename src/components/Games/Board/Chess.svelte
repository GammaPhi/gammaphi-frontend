<script>
import { onMount } from "svelte";

import { get, derived, writable } from "svelte/store";
import { formatBoard, NUM_ROWS, NUM_COLS, coordsToIndex, indexToCoords } from "../../../js/board-utils";
import { sendBoardGameTransaction } from "../../../js/lamden-utils";
import Actions from "./Actions.svelte";
import { lamden_vk } from "../../../stores/lamdenStores";

const game_type = 'chess';
const default_board = 'rnbqkbnrpppppppp                                PPPPPPPPRNBQKBNR';
const default_team = "w";

export let game_id = writable(null);
export let game_metadata = writable(null);
export let game_state = writable(null);
export let playable = true;

const board = derived([game_state], ([$game_state]) => {
    return $game_state?.board || default_board;
});

const loadingBoard = derived([game_state], ([$game_state]) => {
    if (!playable) {
        return false;
    }
    return $game_state === null || !$game_state.hasOwnProperty('board');
});

const isCreator = derived([game_metadata], ([$game_metadata]) => {
    return $game_metadata?.creator === $lamden_vk;
});

const team = derived([game_state, isCreator], ([$game_state, $isCreator]) => {
    if ($isCreator) {
        return $game_state?.creator_team || default_team;
    } else {
        return $game_state?.opponent_team || default_team;
    }
});

const formattedBoard = derived([board, team], ([$board, $team]) => {
    return formatBoard($board, $team);
});

const pieceToImageMap = {
    b: '/static/images/chess/bishop_black.png',
    k: '/static/images/chess/king_black.png',
    n: '/static/images/chess/knight_black.png',
    p: '/static/images/chess/pawn_black.png',
    q: '/static/images/chess/queen_black.png',
    r: '/static/images/chess/rook_black.png',
    B: '/static/images/chess/bishop.png',
    K: '/static/images/chess/king.png',
    N: '/static/images/chess/knight.png',
    P: '/static/images/chess/pawn.png',
    Q: '/static/images/chess/queen.png',
    R: '/static/images/chess/rook.png',
}

const selectedPiece = writable(null);
const destinationTile = writable(null);

const teamOfPiece = (piece) => {
    if (piece === ' ') {
        return false;
    }
    if (piece === piece.toUpperCase()) {
        return 'w';
    } else {
        return 'b';
    }
}

const makeMove = async (makeMoveHandler, makeMoveErrors, makeMoveInProgress) => {
    makeMoveErrors.set([]);
    makeMoveInProgress.set(true);

    let initialCoords = indexToCoords($selectedPiece);
    let destinationCoords = indexToCoords($destinationTile);
    if ($team === 'b') {
        // flip
        initialCoords[0] = NUM_ROWS - 1 - initialCoords[0];
        initialCoords[1] = NUM_COLS - 1 - initialCoords[1];
        destinationCoords[0] = NUM_ROWS - 1 - destinationCoords[0];
        destinationCoords[1] = NUM_COLS - 1 - destinationCoords[1];
    }
    console.log(initialCoords);
    console.log(destinationCoords);
    sendBoardGameTransaction(
        "games",
        {
            action: 'move',
            type: game_type,
            game_id: game_id,
            x1: initialCoords[0],
            y1: initialCoords[1],
            x2: destinationCoords[0],
            y2: destinationCoords[1],
        }, makeMoveHandler, (txResults)=>{
        makeMoveInProgress.set(false);
        if (get(makeMoveHandler).errors?.length > 0) {
            makeMoveErrors.set(get(makeMoveHandler).errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    })

}

onMount(()=>{
    selectedPiece.set(null);
    destinationTile.set(null);
    return () => {
        selectedPiece.set(null);
        destinationTile.set(null);
    }
})

const disableMakeMove = derived([selectedPiece, destinationTile], ([$selectedPiece, $destinationTile]) => {
    return $selectedPiece === null || $destinationTile === null;
});


</script>

<style>
.board {
    border: 3px solid black;
    display: inline-flex;
    flex-wrap: wrap;
    width: 200px;
    height: 200px;
    margin: auto;
}

.piece {
    width: 100%;
    height: 100%;
    cursor: pointer;
}

.piece.selected {
    background-color: yellowgreen;
}

.cell {
    display: inline-block;
    margin: 0;
    padding: 0;
    border: 0;
    height: 50px;
    width: 50px;
    text-align: center;
    max-width: 12.5%;
    max-height: 12.5%;
}    

.cell.light.destination, .cell.dark.destination {
    background-color: orange;
}

.cell.light {
    background-color: #cc9741;
}
.cell.dark {
    background-color: #5b4219;
}

@media only screen and (min-width: 320px) {
    .board {
        width: 240px;
        height: 240px;
    }
}

@media only screen and (min-width: 400px) {
    .board {
        width: 300px;
        height: 300px;
    }
}

@media only screen and (min-width: 650px) {
    .board {
        width: 400px;
        height: 400px;
    }
}

.buttons {
    width: 100%;
}
</style>

<div align="center" class="align-center buttons">
    {#if $loadingBoard}
        <p>Loading Board...</p>
        <br /><br /><br />
    {:else}
        <div align="center" class="board align-center">
            {#each $formattedBoard as row, i}
                {#each row as piece, j}
                    <div 
                        class={`cell ${i % 2 == 0 ? (j % 2 == 0 ? "light" : "dark") : (j % 2 == 0 ? "dark" : "light")} ${$destinationTile===coordsToIndex(i,j)?"destination":""}`} 
                        on:click={()=>{if ($selectedPiece !== null) {
                            destinationTile.set(coordsToIndex(i, j));
                        }}}    
                    >
                        {#if piece !== ' '}
                            <img 
                                class={`piece ${$selectedPiece===coordsToIndex(i,j)?"selected":""}`}
                                alt="" 
                                on:click={(e)=>{if(teamOfPiece(piece)===$team){e.stopPropagation();destinationTile.set(null);selectedPiece.set(coordsToIndex(i, j))}}}
                                src={pieceToImageMap[piece]} 
                            />
                        {/if}
                    </div>
                {/each}
            {/each}
        </div>
        <br />
        {#if playable}
        <br />
        <Actions
            game_id={game_id}
            game_type={game_type}
            game_metadata={game_metadata}
            game_state={game_state}
            makeMoveFunc={makeMove}
            disableMakeMove={disableMakeMove}
        />
        {/if}
    {/if}
</div>