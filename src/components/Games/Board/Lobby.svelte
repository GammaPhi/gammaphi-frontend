<script>
import { derived, writable } from "svelte/store";
import BN from 'bignumber.js'
import { sendBoardGameTransaction, sendBoardGameApproval, checkBoardGameContractState, getAddressForUsername } from "../../../js/lamden-utils";
import Go from "./Go.svelte";
import Checkers from "./Checkers.svelte";
import Chess from "./Chess.svelte";
import Link from "../../Link.svelte";
import BnInputField from "../../Inputs/BNInputField.svelte";
import Errors from "../Poker/Errors.svelte";
import Button from "../../Button.svelte";
import Input from "../../Inputs/Input.svelte";
import { onMount } from "svelte";
import { lamden_vk } from "../../../stores/lamdenStores";
import Container from "../../Inputs/Container.svelte";
import { autoRefreshingVariable, formatGameId } from "../../../js/global-utils";
import { sendApprovalHelper } from "../../../js/board-utils";

export let game_type;
export let goBack = null;

const DEBUG = false;

// game stores
const game_id = writable(null);
const game_metadata = writable(null);
const game_state = writable(null);

if (DEBUG) {
    game_id.set('test')
    lamden_vk.set('myvk')
    game_metadata.set({
        wager: BN(10),
        id: 'test',
        game_id: 'test',
        name: 'MyGame',
        creator: 'myvk',
        opponent: 'yourvk',
        rounds: 3
    })
    game_state.set({
        board: 'rnbqkbnrpppppppp                                PPPPPPPPRNBQKBNR',
        current_player: 'w',
        creator_team: 'w',
        opponent_team: 'b',
        //creator_paid: true,
        //opponent_paid: true
    })
}

// other
const gamesUnsorted = writable([]);
const games = derived([gamesUnsorted], ([$gamesUnsorted]) => {
    let array = $gamesUnsorted;
    array.sort(function(a, b) {
        return b.index - a.index;
    })
    return array;
});

// params for starting a game
const wager = writable(BN(0));
const rounds = writable(1);
const name = writable('');
const isPublic = writable(false);
const otherPlayer = writable('');

const showForm = writable(false);
const startGameHandler = writable({});
const startGameErrors = writable([]);
const startGameInProgress = writable(false);
const startGame = async () => {
    startGameErrors.set([]);
    startGameInProgress.set(true);
    let opponent = $otherPlayer;
    if (opponent.length > 0) {
        opponent = await getAddressForUsername(opponent, opponent);
    }
    let kwargs = {
        action: 'create',
        type: game_type,
        public: $isPublic,
        other_player: opponent === 0 ? null : opponent,
        wager: parseInt(BN($wager).toString(), 10),
        rounds: $rounds,
        game_name: $name,
    };
    let func = () => sendBoardGameTransaction('games', kwargs, startGameHandler, (txResults)=>{
        startGameInProgress.set(false);
        if ($startGameHandler.errors?.length > 0) {
            startGameErrors.set($startGameHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    })

    if (BN($wager).comparedTo(BN(0)) === 1) {
        sendApprovalHelper(BN($wager), startGameHandler, startGameErrors, startGameInProgress,
            func
        );
    } else {
        func();
    }
}

var messageCounter = 0;
var allGames = [];
const hasFocus = writable(false);
onMount(() => {
    messageCounter = 0;
    allGames = [];
    if (!DEBUG) {
        hasFocus.set(true);
    }
    return () => {
        messageCounter = 0;
        allGames = [];
        hasFocus.set(false);
    }
})

async function updateGameList() {
    if ($lamden_vk === null) {
        return;
    }
    checkBoardGameContractState("metadata", [game_type, $lamden_vk, 'count']).then(c=>{
        if (c === null || c === undefined) {
            return;
        }
        c = parseInt(c.toString(), 10);
        let c_prev = messageCounter;
        if (c_prev === c) {
            return c;
        }
        let h = (c - c_prev);
        if (h <= 0) {
            return c;
        }
        for (let i = 0; i < h; i++) {
            let r = c - i;
            if (r > 0) {
                checkBoardGameContractState("metadata", [game_type, $lamden_vk, 'game-'+r.toString()]).then((gameId) => {
                    if (gameId === null || gameId === undefined) {
                        return;
                    }
                    checkBoardGameContractState("metadata", [game_type, gameId, 'metadata']).then((metadata)=>{
                        metadata['index'] = r;
                        metadata['id'] = gameId;                    
                        allGames.push(metadata);
                        gamesUnsorted.set(allGames);
                    })
                })
            }
        }                    
        messageCounter = c;
    })
}

async function refreshGameState() {
    if ($game_id === null) {
        return null;
    }
    return await checkBoardGameContractState('metadata', [game_type, $game_id, 'state']);
}

async function refreshGameMetadata() {
    if ($game_id === null) {
        return null;
    }
    return await checkBoardGameContractState('metadata', [game_type, $game_id, 'metadata']);
}

autoRefreshingVariable(
    null,
    updateGameList,
    hasFocus,
    null,
    null,
    5000
);

autoRefreshingVariable(
    game_state,
    refreshGameState,
    hasFocus,
    null,
    null,
    5000
)

autoRefreshingVariable(
    game_metadata,
    refreshGameMetadata,
    hasFocus,
    null,
    null,
    10000
)

</script>

{#if $game_id === null}
    <Link onClick={goBack}>Back to Board Games</Link>
    <h2>
    {#if game_type === 'go'}
        Go
    {:else if game_type === 'checkers'}
        Checkers
    {:else if game_type === 'chess'}
        Chess
    {/if}
    </h2>
    <Link onClick={()=>showForm.set(!$showForm)}>
        Create a Game
    </Link>
    <br /><br />
    {#if $showForm}
        <Input onClick={name.set} value={$name} label="Name" />
        <br />
        <p>Number of Rounds</p>
        <label>
            <input 
            type="radio"
            name="rounds"
            checked={$rounds === 1}
            on:click={()=>rounds.set(1)}
            />
            1 Round
        </label>
        <label>
            <input 
            type="radio"
            name="rounds"
            checked={$rounds === 3}
            on:click={()=>rounds.set(3)}
            />
            Best 2/3
        </label>
        <label>
            <input 
            type="radio"
            name="rounds"
            checked={$rounds === 5}
            on:click={()=>rounds.set(5)}
            />
            Best 3/5
        </label>
        <br /><br />
        <BnInputField
            onInputChange={(value)=>wager.set(value)}
            startingValue={$wager}
            inputClass="primaryInput"
            labelClass="label"
            labelText="Wager"
        />        
        <br /><br />
        <label>Make Public
            <input 
                type="checkbox"
                checked={$isPublic}
                on:change={(e) => {isPublic.set(e.target.checked); otherPlayer.set('')}}
            />
        </label> 
        <br />
        {#if !$isPublic}
            <br />
            <Input onClick={otherPlayer.set} value={$otherPlayer} label="Opponent" />
            <br />
        {/if}
        <br />
        <Errors errors={startGameErrors} />
        <Button
            text={$startGameInProgress ? "Creating..." : "Create"}
            disabled={$name.length === 0 || $startGameInProgress}
            clicked={startGame}
        />
    {/if}
    <Container>
        <h3>Your Games</h3>
        {#if Array.isArray($games)}
            {#each $games as game}
                    <Link onClick={()=>{game_id.set(game['id']); game_state.set(null); game_metadata.set(game)}}>
                        {game['name'] || formatGameId(game['id'])}
                    </Link>
                <br />
            {/each}    
        {/if}
    </Container>
    <br /><br />
{:else}
    <Link onClick={()=>{game_id.set(null); game_metadata.set(null), game_state.set(null)}}>Back to Lobby</Link>
    <h2>
    {#if game_type === 'go'}
        Go
    {:else if game_type === 'checkers'}
        Checkers
    {:else if game_type === 'chess'}
        Chess
    {/if}
    </h2>
    {#if game_type === 'go'}        
        <Go game_id={$game_id} game_metadata={game_metadata} game_state={game_state} />
    {:else if game_type === 'checkers'}
        <Checkers game_id={$game_id} game_metadata={game_metadata} game_state={game_state} />
    {:else if game_type === 'chess'}
        <Chess game_id={$game_id} game_metadata={game_metadata} game_state={game_state} />
    {/if}
{/if}