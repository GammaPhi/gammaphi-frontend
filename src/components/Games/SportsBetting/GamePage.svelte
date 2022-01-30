<script>
import { onMount } from "svelte";
import { writable } from "svelte/store";
import { listWagersForGame } from "../../../js/sports-betting-provider";
import Button from "../../Button.svelte";
import BNInputField from "../../Inputs/BNInputField.svelte";
import Link from "../../Link.svelte";
import BN from 'bignumber.js'
import Errors from "../Poker/Errors.svelte";
import { checkContractState, getSportsBettingContract, sendDaoAction, sendTokenApproval } from "../../../js/lamden-utils";
import Tabs from "../../Tabs/Tabs.svelte";
import TabList from "../../Tabs/TabList.svelte";
import Tab from "../../Tabs/Tab.svelte";
import TabPanel from "../../Tabs/TabPanel.svelte";


export let game, goBack, startingValue = BN(10000);

const spreads = writable([]);
const totals = writable([]);

const selectedWager = writable(null);
const moneyLineOptions = writable([]);
const placeBetInputValue = writable(startingValue);

onMount(() => {
    selectedWager.set(null);
    if (game.sport.startsWith('soccer')) {
        moneyLineOptions.set([game.away_team, game.home_team, 'Draw'])
    } else {
        moneyLineOptions.set([game.away_team, game.home_team])
    }
    listWagersForGame(game, 'spread').then(w=>{
        spreads.set(w);
    })
    listWagersForGame(game, 'total').then(w=>{
        totals.set(w);
    })
});

const getWagerDescription = (wager) => {
    let description = '';
    if (wager.name === 'moneyline') {
        if (wager.option_id === 0) {
            description = `${game.away_team} wins`
        } else if (wager.option_id === 1) {
            description = `${game.home_team} wins`
        } else if (wager.option_id === 2) {
            description = 'Draw'
        }

    } else if (wager.name === 'spread') {
        if (wager.option_id === 0) {
            description = `${game.away_team} beats ${wager.spread} spread`

        } else if (wager.option_id === 1) {
            description = `${game.home_team} beats ${-wager.spread} spread`
        }

    } else if (wager.name === 'total') {
        if (wager.option_id === 0) {
            description = `Over ${wager.total}`
        } else if (wager.option_id === 1) {
            description = `Under ${wager.total}`
        }
    }
    return description;
};


const placeBetHandler = writable({});
const placeBetErrors = writable([]);
const placeBetInProgress = writable(false);
const placeBet = async () => {
    const contract = await getSportsBettingContract()
    if (contract === null) {
        alert("Could not find sports betting contract.")
        return;
    }    
    placeBetInProgress.set(true);
    placeBetErrors.set([]);
    function placeBetHelper(event_id) {
        sendTokenApproval(BN($placeBetInputValue), "con_phi_lst001", contract, placeBetHandler, (txResults)=>{
            if ($placeBetHandler.errors?.length > 0) {
                placeBetInProgress.set(false);
                placeBetErrors.set($placeBetHandler.errors)
            } else {
                console.log("Approved");
                console.log(txResults);
                let placeBetKwargs = {
                    function: 'place_bet',
                    kwargs: {
                        event_id: event_id,
                        option_id: $selectedWager.option_id,
                        amount: {
                            __fixed__: BN($placeBetInputValue).toString()
                        }
                    }
                }
                sendDaoAction('sports_betting', placeBetKwargs, placeBetHandler, (txResults)=>{
                    placeBetInProgress.set(false);
                    if ($placeBetHandler.errors?.length > 0) {
                        placeBetErrors.set($placeBetHandler.errors)
                    } else {
                        console.log("Success");
                        console.log(txResults);
                    }
                });
            }
        });

    }
    let event_id = await checkContractState(contract, 'events', [game.sport, game.away_team, game.home_team, game.date], null)
    if (event_id === null) {
        // need to create event
        let wager = {
            name: $selectedWager.name,
            options: $selectedWager.options,        
        }
        if (wager.name === 'spread') {
            wager.spread = $selectedWager.spread
        } else if (wager.name === 'total') {
            wager.total = $selectedWager.total
        }
        let addEventKwargs = {
            function: 'add_event',
            kwargs: {
                metadata: {
                    away_team: game.away_team,
                    home_team: game.home_team,
                    date: game.date,
                    timestamp: game.timestamp,
                    sport: game.sport,
                },
                timestamp: game.timestamp,
                wager: wager
            }
        }
        sendDaoAction('sports_betting', addEventKwargs, placeBetHandler, (txResults)=>{
            if ($placeBetHandler.errors?.length > 0) {
                placeBetInProgress.set(false);
                placeBetErrors.set($placeBetHandler.errors)
            } else {
                console.log("Success");
                console.log(txResults);
                event_id = parseInt(txResults.txBlockResult.returnResult, 10);
                console.log("Event id: "+event_id)
                placeBetHelper(event_id);
            }
        });
    } else {
        placeBetHelper(event_id)
    }
}

</script>


{#if $selectedWager === null}
    <Link onClick={()=>goBack()}>Back to Game List</Link>
    <h2>Wagers</h2>
    <Tabs initialSelectedTabIndex={0}>
        <TabList>
            <Tab>Moneyline</Tab>
            <Tab>Spreads</Tab>
            <Tab>Totals</Tab>
        </TabList>
        <TabPanel>
            <h3>Moneyline</h3>
            <Button
                text="Bet on Away"
                clicked={()=>selectedWager.set({
                    option_id: 0,
                    name: 'moneyline',
                    options: $moneyLineOptions
                })}
            />
            <Button
                text="Bet on Home"
                clicked={()=>selectedWager.set({
                    option_id: 1,
                    name: 'moneyline',
                    options: $moneyLineOptions
                })}
            />
            {#if $moneyLineOptions.length > 2}
                <Button
                    text="Bet on Draw"
                    clicked={()=>selectedWager.set({
                        option_id: 2,
                        name: 'moneyline',
                        options: $moneyLineOptions
                    })}
                />
            {/if}
        </TabPanel>
        <TabPanel>
            <h3>Spreads</h3>
            {#if $spreads.length === 0}
                <p>No spreads found.</p>
            {:else}
                {#each $spreads as wager}  
                    <p>Spread: {wager.away_spread["$numberDecimal"]}</p>    
                    <Button
                        text="Bet on Away"
                        clicked={()=>selectedWager.set({
                            option_id: 0,
                            name: 'spread',
                            options: [game.away_team, game.home_team],
                            spread: parseFloat(wager.away_spread["$numberDecimal"])
                        })}
                    />
                    <Button
                        text="Bet on Home"
                        clicked={()=>selectedWager.set({
                            option_id: 1,
                            name: 'spread',
                            options: [game.away_team, game.home_team],
                            spread: parseFloat(wager.away_spread["$numberDecimal"])
                        })}
                    />
                {/each}
            {/if}
        </TabPanel>
        <TabPanel>           
            <h3>Totals</h3>
            {#if $totals.length === 0}
                <p>No totals found.</p>
            {:else}
                {#each $totals as wager}
                    <p>Total: {wager.away_total["$numberDecimal"]}</p>    
                    <Button
                        text="Bet Over"
                        clicked={()=>selectedWager.set({
                            option_id: 0,
                            name: 'total',
                            options: [game.away_team, game.home_team],
                            total: parseFloat(wager.away_total["$numberDecimal"])
                        })}
                    />
                    <Button
                        text="Bet Under"
                        clicked={()=>selectedWager.set({
                            option_id: 1,
                            name: 'total',
                            options: [game.away_team, game.home_team],
                            total: parseFloat(wager.away_total["$numberDecimal"])
                        })}
                    />
                {/each}
            {/if} 
        </TabPanel>
    </Tabs>

{:else}
    <Link onClick={()=>selectedWager.set(null)}>Back to Wagers</Link>

    <h2>Place Bet</h2>

    <p>{getWagerDescription($selectedWager)}</p>
    <div class="row align-center buttons">
        <BNInputField
            onInputChange={(value)=>placeBetInputValue.set(BN(value))}
            startingValue={startingValue}
            inputClass="primaryInput"
            labelClass="label"
            labelText="Your PHI Wager"
        />
        <Errors errors={placeBetErrors} />
        <Button
            text={$placeBetInProgress ? "Betting..." : "Place Bet"}
            clicked={placeBet}
            disabled={$placeBetInProgress}
        />    
    </div>
{/if}