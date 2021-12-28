<script>
import { derived, writable } from "svelte/store";
import Button from "../../Button.svelte";

const NUM_ROWS = 8;
const NUM_COLS = 8;

export let board = writable('                                                                ');
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

const selectedTile = writable(null);

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
    let coords = indexToCoords($selectedTile);
    if (team === 'b') {
        // flip
        coords[0] = NUM_ROWS - 1 - coords[0];
        coords[1] = NUM_COLS - 1 - coords[1];
    }
    console.log(coords);
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
    background-color: white;
    cursor: default;
}

.piece-wrapper.black {
    background-color: black;
    cursor: default;
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

<h2>Go</h2>

<div align="center" class="align-center buttons">
    <div align="center" class="board align-center">
        {#each $formattedBoard as row, i}
            {#each row as piece, j}
                <div 
                    class={`cell ${i % 2 == 0 ? (j % 2 == 0 ? "light" : "dark") : (j % 2 == 0 ? "dark" : "light")} ${$selectedTile===coordsToIndex(i,j)?"selected":""}`} 
                    on:click={()=>{if (piece === ' ') {
                        selectedTile.set(coordsToIndex(i, j));
                    }}}    
                >
                    {#if piece !== ' '}
                        <span 
                            class={`piece-wrapper ${piece==='w' ? "white" : "black"}`}
                        >
                        </span>
                    {/if}
                </div>
            {/each}
        {/each}
    </div>
    <br /><br />
    <Button
        disabled={$selectedTile===null}
        text="Move"
        clicked={makeMove}
    />
</div>