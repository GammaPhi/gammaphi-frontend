<script>
import { onMount } from "svelte";

import { get, derived, writable } from "svelte/store";
import { sendBoardGameTransaction } from "../../../js/lamden-utils";
import { formatBoard, NUM_ROWS, NUM_COLS, coordsToIndex, indexToCoords 
} from "../../../js/board-utils";
import Actions from "./Actions.svelte";
import { lamden_vk } from "../../../stores/lamdenStores";

const game_type = "go";
const default_board = ' ww   b   bbw        b       b     w w                          ';
const default_team = "b";

export let game_id = writable(null);
export let game_metadata = writable(null);
export let game_state = writable(null);
export let playable = true;

const board = derived([game_state], ([$game_state]) => {
    return $game_state?.board || default_board;
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

const selectedTile = writable(null);

const makeMove = async (makeMoveHandler, makeMoveErrors, makeMoveInProgress) => {
    makeMoveErrors.set([]);
    makeMoveInProgress.set(true);

    let coords = indexToCoords($selectedTile);
    if ($team === 'b') {
        // flip
        coords[0] = NUM_ROWS - 1 - coords[0];
        coords[1] = NUM_COLS - 1 - coords[1];
    }    
    console.log(coords);
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
    selectedTile.set(null);
    return () => {
        selectedTile.set(null);
    }
})

const disableMakeMove = derived([selectedTile], ([$selectedTile]) => {
    return $selectedTile === null;
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
</div>