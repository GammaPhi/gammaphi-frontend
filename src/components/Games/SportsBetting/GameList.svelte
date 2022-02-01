<script>
import { onMount } from "svelte";
import { derived, writable } from "svelte/store";
import { checkContractState } from "../../../js/lamden-utils";
import { listGames, SPORTS_METADATA } from "../../../js/sports-betting-provider";
import Button from "../../Button.svelte";
import Link from "../../Link.svelte";
import GamePage from "./GamePage.svelte";

export let sport, goBack;

const getSecondsSinceEpoch = (date) => {
    return Math.round(date.getTime() / 1000)
}

const filters = writable({});
const startTimestamp = writable(getSecondsSinceEpoch(new Date()));
const endTimestamp = writable(null);
const selectedGame = writable(null);
const games = writable([]);
const loading = writable(false);

onMount(()=>{
    loading.set(true);
    const filters = {}
    if (sport.length !== 0) {
        filters['sport'] = sport;
    }
    if (sport === 'soccer') {
        filters['sport'] = {
            '$in': Object.keys(SPORTS_METADATA.subCategories[sport])
        }
    }
    if ($startTimestamp !== null) {
        filters['timestamp'] = {'$gte': $startTimestamp}
    }
    if ($endTimestamp !== null) {
        filters['timestamp'] = {'$lt': $endTimestamp}
    }
    console.log("Using filters: ");
    console.log(filters);
    listGames(filters).then(results=>{
        console.log('Results:');
        console.log(results)
        results.sort((a, b) => a.timestamp - b.timestamp);
        games.set(results);
        loading.set(false);
    });    
})

</script>

<style>
    .game-card {
        border: 2px solid var(--primary-color);
        padding: 1em;
        vertical-align: middle;
        margin-top: auto;
        margin-bottom: auto;
        padding-bottom: 2em;
        border-radius: 5px;    
    }
</style>

{#if $selectedGame === null}
    <Link onClick={()=>goBack()}>Back to Sport List</Link>

    {#if sport.length === 0}
        <h2>All Events</h2>
    {:else}
        <h2>{SPORTS_METADATA.displayNames[sport]}</h2>
    {/if}

    {#if $loading}
        <p>Loading...</p>
    {:else}
        {#if Array.isArray($games)}
            {#if $games.length === 0}
                <p>No events found.</p>
            {:else}
                {#each $games as game}
                    <div class="game-card">
                        {#if sport.length === 0}
                            <h4>{SPORTS_METADATA.displayNames[game.sport.startsWith('soccer') ? 'soccer':game.sport]}</h4>
                        {/if}
                        <p>{game.date.substring(0, 10)}</p>
                        <p>Away: {game.away_team}</p>
                        <p>Home: {game.home_team}</p>
                        <Link onClick={()=>selectedGame.set(game)}>Check Wagers</Link>
                    </div>
                    <br />
                {/each}
            {/if}
        {/if}
    {/if}
{:else}

    <GamePage
        game={$selectedGame}
        goBack={()=>selectedGame.set(null)}
    />

{/if}