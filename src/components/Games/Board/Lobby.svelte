<script>
import { derived, writable } from "svelte/store";
import BN from 'bignumber.js'
import { sendBoardGameTransaction, sendBoardGameApproval, checkBoardGameContractState } from "../../../js/lamden-utils";
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
import { formatGameId } from "../../../js/global-utils";

export let game_type;
export let goBack = null;

// game stores
const game_id = writable(null);
const game_metadata = writable(null);

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
    let kwargs = {
        action: 'start',
        type: game_type,
        public: $isPublic,
        other_player: $otherPlayer.length === 0 ? null : $otherPlayer,
        wager: {
            __fixed__: $wager.toString()
        },
        rounds: $rounds,
        game_name: $name,
    };
    sendBoardGameTransaction('games', kwargs, startGameHandler, (txResults)=>{
        startGameInProgress.set(false);
        if ($startGameHandler.errors?.length > 0) {
            startGameErrors.set($startGameHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    })

}

var messageCounter = 0;
var allGames = [];
const hasFocus = writable(false);
onMount(() => {
    messageCounter = 0;
    allGames = [];
    hasFocus.set(true);
    return () => {
        messageCounter = 0;
        allGames = [];
        hasFocus.set(false);
    }
})

async function updateGameList() {
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

</script>


<Link onClick={goBack}>Back to Board Games</Link>


{#if $game_id === null}
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
        <br /><br />
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
                on:change={(e) => isPublic.set(e.target.checked)}
            />
        </label>    
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
                    <Link onClick={()=>{game_id.set(game['id']); game_metadata.set(game)}}>
                        {game['name'] || formatGameId(game['id'])}
                    </Link>
                <br />
            {/each}    
        {/if}
    </Container>
    <br /><br />
{:else}
    {#if game_type === 'go'}        
        <Go game_id={$game_id} game_metadata={game_metadata} />
    {:else if game_type === 'checkers'}
        <Checkers game_id={$game_id} game_metadata={game_metadata} />
    {:else if game_type === 'chess'}
        <Chess game_id={$game_id} game_metadata={game_metadata} />
    {/if}
{/if}