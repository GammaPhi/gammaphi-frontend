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

const filters = writable({sport: sport});
const startTimestamp = writable(getSecondsSinceEpoch(new Date()));
const endTimestamp = writable(null);
const selectedGame = writable(null);


const games = derived([startTimestamp, endTimestamp, filters], async ([$startTimestamp, $endTimestamp, $filters], set) => {
    const _filters = $filters;
    if (sport === 'soccer') {
        _filters['sport'] = {
            '$in': Object.keys(SPORTS_METADATA.subCategories[sport])
        }
    }
    if ($startTimestamp !== null) {
        _filters['timestamp'] = {'$gte': $startTimestamp}
    }
    if ($endTimestamp !== null) {
        _filters['timestamp'] = {'$lt': $endTimestamp}
    }
    console.log("Using filters: ");
    console.log(_filters);
    let results = await listGames(_filters);
    results.sort((a, b) => a.timestamp - b.timestamp);
    set(results);
})

</script>

<style>
    .game {
        margin-top: 2em;
    }
</style>

{#if $selectedGame === null}
    <Link onClick={()=>goBack()}>Back to Sport List</Link>

    <h2>{SPORTS_METADATA.displayNames[sport]}</h2>

    {#if Array.isArray($games)}
        {#each $games as game}

            <div class="game">
                <p>{game.date.substring(0, 10)}</p>
                <p>Away: {game.away_team}</p>
                <p>Home: {game.home_team}</p>
                <Link onClick={()=>selectedGame.set(game)}>Check Wagers</Link>
            </div>

        {/each}
    {/if}
{:else}

    <GamePage
        game={$selectedGame}
        goBack={()=>selectedGame.set(null)}
    />

{/if}