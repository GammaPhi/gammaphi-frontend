<script>
import { writable } from 'svelte/store';


import { SPORTS_METADATA } from '../../../js/sports-betting-provider'
import Link from '../../Link.svelte';
import Tab from '../../Tabs/Tab.svelte';
import TabList from '../../Tabs/TabList.svelte';
import TabPanel from '../../Tabs/TabPanel.svelte';
import Tabs from '../../Tabs/Tabs.svelte';
import GameList from './GameList.svelte';
import MyBets from './MyBets.svelte';

const selectedSport = writable(null);

</script>

<style>
    .sport-card {
        border: 2px solid var(--primary-color);
        padding: 1em;
        vertical-align: middle;
        margin-top: auto;
        margin-bottom: auto;
        border-radius: 5px;    
        cursor: pointer;
    }
    
    .sport-card:hover {
        border: 2px solid var(--accent-color);
    }
</style>


<Tabs initialSelectedTabIndex={0}>
    <TabList>
        <Tab>Events</Tab>
        <Tab>My Bets</Tab>        
    </TabList>
    <TabPanel>
        <br /><br />
        {#if $selectedSport === null}

            <div on:click={()=>selectedSport.set('')} class="sport-card">
                <Link onClick={()=>{}}>All Events</Link>
            </div>
            <br />
        
            {#each SPORTS_METADATA.sports as sport}
        
            <div on:click={()=>selectedSport.set(sport)} class="sport-card">
                <Link onClick={()=>{}}>{SPORTS_METADATA.displayNames[sport]}</Link>
            </div>
            <br />
            {/each}
        
        {:else}
        
            <GameList sport={$selectedSport} goBack={()=>selectedSport.set(null)} />
        
        {/if}
    </TabPanel>
    <TabPanel>
        <MyBets />
    </TabPanel>
</Tabs>

