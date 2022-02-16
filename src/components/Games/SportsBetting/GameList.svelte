<script>
import { onMount } from "svelte";
import { derived, writable } from "svelte/store";
import { checkContractState } from "../../../js/lamden-utils";
import { listGames, SPORTS_METADATA } from "../../../js/sports-betting-provider";
import Button from "../../Button.svelte";
import { Datepicker } from 'svelte-calendar';
import Link from "../../Link.svelte";
import GamePage from "./GamePage.svelte";
import dayjs from 'dayjs';

export let sport, goBack;

let theme = {
  "calendar": {
    "width": "280px",
    "maxWidth": "100vw",
    "legend": {
      "height": "45px"
    },
    "shadow": "0px 10px 26px rgba(0, 0, 0, 0.25)",
    "colors": {
      "text": {
        "primary": "#eee",
        "highlight": "#fff"
      },
      "background": {
        "primary": "#333",
        "highlight": "#5829d6",
        "hover": "#222"
      },
      "border": "#222"
    },
    "font": {
      "regular": "0.8em",
      "large": "5em"
    },
    "grid": {
      "disabledOpacity": ".5",
      "outsiderOpacity": ".7"
    }
  }
}

let store;
const selectedDate = writable(new Date());
const selectedGame = writable(null);
const loading = writable(false);

const games = derived([selectedDate], ([$selectedDate], set) => {
    const filters = {}
    if (sport.length !== 0) {
        filters['sport'] = sport;
    }
    if (sport === 'soccer') {
        filters['sport'] = {
            '$in': Object.keys(SPORTS_METADATA.subCategories[sport])
        }
    }
    if ($selectedDate !== null) {
        filters['date'] = $selectedDate.toISOString().substring(0, 10)
    } else {
        filters['date'] = dayjs(new Date()).format('YYYY-mm-dd')
    }
    loading.set(true);

    console.log("Using filters: ");
    console.log(filters);
    listGames(filters).then(results=>{
        console.log('Results:');
        console.log(results)
        results.sort((a, b) => a.timestamp - b.timestamp);
        set(results);
        loading.set(false);
    });    
})

const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
}

const formatHomeScore = (event) => {
    let results = event.results;
    if (event.sport === 'tennis') {
        return `${results.home_sets_won} Sets`
    } else {
        return `${results.home_score}`
    }
}

const formatAwayScore = (event) => {
    let results = event.results;
    if (event.sport === 'tennis') {
        return `${results.away_sets_won} Sets`
    } else {
        return `${results.away_score}`
    }
}

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

    <br /><br /><br />

    <Datepicker {theme} selected={new Date()} bind:store let:key let:send let:receive>
        <button in:receive|local={{ key }} out:send|local={{ key }}>
            {#if $store?.hasChosen}
                {(()=>{ selectedDate.set($store.selected); return dayjs($store.selected).format('ddd MMM D, YYYY')})()}
            {:else}
                {dayjs(new Date()).format('ddd MMM D, YYYY')}
            {/if}
        </button>
    </Datepicker>

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
                        {#if typeof game.winner_index !== 'undefined' && game.winner_index !== null}
                            <p>Away: {game.away_team} - {formatAwayScore(game)}</p>
                            <p>Home: {game.home_team} - {formatHomeScore(game)}</p>
                            <p>Time: {formatTime(game.timestamp)}</p>
                        {:else}
                            <p>Away: {game.away_team}</p>
                            <p>Home: {game.home_team}</p>
                            <p>Time: {formatTime(game.timestamp)}</p>
                           <Link onClick={()=>selectedGame.set(game)}>Check Wagers</Link>
                        {/if}
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