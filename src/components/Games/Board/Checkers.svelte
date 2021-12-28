<script>
import { onMount } from "svelte";

import { derived, writable } from "svelte/store";
import { sendBoardGameTransaction } from "../../../js/lamden-utils";
import { formatBoard, NUM_ROWS, NUM_COLS, coordsToIndex, indexToCoords } from "../../../js/board-utils";
import Button from "../../Button.svelte";
import Errors from "../Poker/Errors.svelte";

const game_type = 'checkers';

export let board = writable(' b b b bb b b b  b b b b                w w w w  w w w ww w w w ');
export let team = "b";
export let game_id = null;
export let game_metadata = {};
export let playable = true;

const formattedBoard = derived([board], ([$board]) => {
    return formatBoard($board, team);
});

const pieceToImageMap = {
    B: '/static/images/checkers/king_black.png',
    W: '/static/images/checkers/king_black.png',
}

const selectedPiece = writable(null);
const destinationTiles = writable(null);

const teamOfPiece = (piece) => {
    if (piece === ' ') {
        return false;
    }
    return piece.toLowerCase();
}

const makeMoveHandler = writable({});
const makeMoveErrors = writable([]);
const makeMoveInProgress = writable(false);
const makeMove = async () => {
    makeMoveErrors.set([]);
    makeMoveInProgress.set(true);

    let initialCoords = indexToCoords($selectedPiece);
    let destinationCoords = [];
    let _destinationTiles = $destinationTiles;
    for (let i = 0; i < _destinationTiles.length; i++) {
        let destinationTile = _destinationTiles[i];
        let destinationCoord = indexToCoords(destinationTile);
        destinationCoords.push(destinationCoord);
    }
    if (team === 'b') {
        // flip
        initialCoords[0] = NUM_ROWS - 1 - initialCoords[0];
        initialCoords[1] = NUM_COLS - 1 - initialCoords[1];
        for (let i = 0; i < destinationCoords.length; i++) {
            let destinationCoord = destinationCoords[i];
            destinationCoord[0] = NUM_ROWS - 1 - destinationCoord[0];
            destinationCoord[1] = NUM_COLS - 1 - destinationCoord[1];
        }
    }
    let x2 = destinationCoords.map((a)=>a[0]);
    let y2 = destinationCoords.map((a)=>a[1]);
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
            x2: x2,
            y2: y2,
        }, makeMoveHandler, (txResults)=>{
        makeMoveInProgress.set(false);
        if ($makeMoveHandler.errors?.length > 0) {
            makeMoveErrors.set($makeMoveHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    })
}

const pushDestinationTile = (x, y) => {
    let arr = $destinationTiles || [];
    let index = coordsToIndex(x, y);
    if (arr.length > 0) {
        if (arr[arr.length-1] == index) {
            return;
        }
    }
    arr.push(index);
    destinationTiles.set(arr);
}

onMount(()=>{
    selectedPiece.set(null);
    destinationTiles.set(null);
    return () => {
        selectedPiece.set(null);
        destinationTiles.set(null);
    }
})

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
    width: 80%;
    height: 100%;
}

.piece-wrapper {
    width: 80%;
    height: 80%;
    margin: 10%;
    border-radius: 50%;
    display: inline-block;
    cursor: pointer;
}

.piece-wrapper.white {
    background-color: red;
}

.piece-wrapper.black {
    background-color: black;
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

.cell.light.selected, .cell.dark.selected {
    background-color: yellowgreen;
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
    <div align="center" class="board align-center">
        {#each $formattedBoard as row, i}
            {#each row as piece, j}
                <div 
                    class={`cell ${i % 2 == 0 ? (j % 2 == 0 ? "light" : "dark") : (j % 2 == 0 ? "dark" : "light")} ${$selectedPiece===coordsToIndex(i,j)?"selected":""} ${$destinationTiles!==null && $destinationTiles.includes(coordsToIndex(i,j))?"destination":""}`} 
                    on:click={()=>{if ($selectedPiece !== null) {
                        if ((i % 2 == 0 && j % 2 == 1) || (i % 2 == 1 && j % 2 == 0)){
                            pushDestinationTile(i, j);
                        }
                    }}}    
                >
                    {#if piece !== ' '}
                        <span 
                            class={`piece-wrapper ${piece==='w' || piece==='W'? "white" : "black"}`}
                            on:click={(e)=>{if(teamOfPiece(piece)===team){e.stopPropagation();destinationTiles.set(null);selectedPiece.set(coordsToIndex(i, j))}}}
                        >
                            {#if pieceToImageMap.hasOwnProperty(piece)}
                                <img 
                                    class="piece"
                                    alt="" 
                                    src={pieceToImageMap[piece]} 
                                />
                            {/if}
                        </span>
                    {/if}
                </div>
            {/each}
        {/each}
    </div>
    <br />
    {#if playable}
    <br />
    <Errors errors={makeMoveErrors} />
    <Button
        disabled={$selectedPiece===null || $destinationTiles===null}
        text="Move"
        clicked={makeMove}
    />
    {/if}
</div>