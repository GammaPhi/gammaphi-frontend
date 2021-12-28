<script>
import { derived, writable } from "svelte/store";
import Button from "../../Button.svelte";

const NUM_ROWS = 8;
const NUM_COLS = 8;

export let board = writable(' B b b bb b b b  b b b b                W w w w  w w w ww w w w ');
export let team = "b";

const formattedBoard = derived([board], ([$board]) => {
    let array = [];
    for(let i = 0; i < NUM_ROWS; i++) {
        let row = $board.substring(i*NUM_ROWS, i*NUM_ROWS+NUM_COLS).split('');
        if (team === 'b') {
            row.reverse();
        }
        array.push(row);        
    }
    if (team === 'b') {
        array.reverse();
    }
    return array;
});

const pieceToImageMap = {
    B: '/static/images/checkers/king_black.png',
    W: '/static/images/checkers/king_black.png',
}

const selectedPiece = writable(null);
const destinationTiles = writable(null);

const coordsToIndex = (row, col) => {
    return row * NUM_ROWS + col;
}

const indexToCoords = (index) => {
    return [Math.floor(index / NUM_ROWS), index % NUM_COLS];
}

const teamOfPiece = (piece) => {
    if (piece === ' ') {
        return false;
    }
    return piece.toLowerCase();
}

const makeMove = async () => {
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
    console.log(initialCoords);
    console.log(destinationCoords);
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

<h2>Checkers</h2>

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
    <br /><br />
    <Button
        disabled={$selectedPiece===null || $destinationTiles===null}
        text="Move"
        clicked={makeMove}
    />
</div>