<script>
import { writable } from 'svelte/store';


import { SPORTS_METADATA } from '../../../js/sports-betting-provider'
import Button from '../../Button.svelte';
import Link from '../../Link.svelte';
import GameList from './GameList.svelte';

const selectedSport = writable(null);

</script>

<style>
    .sport-card {
        margin-top: 2em;
    }
</style>

{#if $selectedSport === null}
    <h2>Available Sports</h2>

    {#each SPORTS_METADATA.sports as sport}

    <div class="sport-card">
        <h3>{SPORTS_METADATA.displayNames[sport]}</h3>
        <Link onClick={()=>selectedSport.set(sport)}>See Events</Link>
    </div>
    <br />
    {/each}

{:else}

    <GameList sport={$selectedSport} goBack={()=>selectedSport.set(null)} />

{/if}