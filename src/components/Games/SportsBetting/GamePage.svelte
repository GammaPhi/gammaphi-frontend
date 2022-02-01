<script>
import { onMount } from "svelte";
import { derived, writable } from "svelte/store";
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
import { lamden_vk } from "../../../stores/lamdenStores";
import forge from 'forge';


export let game, goBack, startingValue = BN(10000);

const spreads = writable([]);
const totals = writable([]);

const selectedWager = writable(null);
const moneyLineOptions = writable([]);
const placeBetInputValue = writable(startingValue);
const contractName = writable(null);

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
    getSportsBettingContract().then(w=>{
        contractName.set(w);
    })
});

const eventHash = derived([selectedWager], ([$selectedWager]) => {
    if ($selectedWager === null) {
        return null;
    }
    const wagerType = $selectedWager.name;
    const wagerOptions = $selectedWager.options;
    const toHash = [
        game.sport, game.away_team, game.home_team, game.date, wagerType
    ];

    for (let i = 0; i < wagerOptions.length; i++) {
        toHash.push(wagerOptions[i])
    }

    if (wagerType === 'spread') {
        toHash.push($selectedWager.spreadStr)
    } else if (wagerType === 'total') {
        toHash.push($selectedWager.totalStr)
    }
    const toHashStr = toHash.join(",")
    const md = forge.md.sha256.create();
    md.update(toHashStr);
    const hash = md.digest().toHex()
    console.log("Hash: "+hash);
    return hash;
});

const eventId = derived([eventHash, contractName], ([$eventHash, $contractName], set) => {
    if ($contractName === null) {
        return null;
    }
    if ($eventHash === null) {
        return null;
    }
    checkContractState($contractName, 'events', [$eventHash], null).then(w=>{
        set(w);
    })
});


const priceInfo = derived([eventId], ([$eventId], set) => {
    if ($eventId === null) {
        return null;
    }
    console.log("Event id: "+$eventId);
    const pInfo = {};
    checkContractState($contractName, 'bets', [$eventId, 0], BN(0)).then(p0=>{
        checkContractState($contractName, 'bets', [$eventId, 1], BN(0)).then(p1=>{
            checkContractState($contractName, 'bets', [$eventId, 2], BN(0)).then(p2=>{
                const total = p0.plus(p1).plus(p2);
                if (total.comparedTo(BN(0)) === 0) {
                    // no bets
                } else {
                    let odds0 = p0.div(total);
                    let odds1 = p1.div(total);
                    let odds2 = p2.div(total);
                    pInfo['odds'] = [odds0, odds1, odds2]; 
                    pInfo['total'] = total;                  
                }
                set(pInfo);
            })
        })
    })
})


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
    const contract = $contractName;
    if (contract === null) {
        alert("Could not find sports betting contract.")
        return;
    }    
    placeBetInProgress.set(true);
    placeBetErrors.set([]);
    function placeBetHelper(event_id) {
        console.log("placeBetHelper")
        sendTokenApproval(BN($placeBetInputValue), "con_phi_lst001", contract, placeBetHandler, (txResults)=>{
            console.log("sendTokenApproval")
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
                    console.log("sendDaoAction")
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
    let event_id = $eventId;
    if (event_id === null) {
        // need to create event
        console.log("no event id")
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
        console.log("addEvent")
        console.log(addEventKwargs)
        sendDaoAction('sports_betting', addEventKwargs, placeBetHandler, (txResults)=>{
            console.log("sendDaoAction")
            if ($placeBetHandler.errors?.length > 0) {
                placeBetInProgress.set(false);
                placeBetErrors.set($placeBetHandler.errors)
            } else {
                console.log("Success");
                console.log(txResults);
                event_id = parseInt(txResults.resultInfo.returnResult, 10);
                console.log("Event id: "+event_id)
                eventId.set(event_id)
                placeBetHelper(event_id);
            }
        });
    } else {
        placeBetHelper(event_id)
    }
}

</script>


<style>
    .wager-card {
        border: 2px solid var(--primary-color);
        padding: 1em;
        vertical-align: middle;
        margin-top: auto;
        margin-bottom: auto;
        border-radius: 5px;    
    }
</style>


{#if $selectedWager === null}
    <Link onClick={()=>goBack()}>Back to Game List</Link>
    <h2>Wagers</h2>
    <p>Away: {game.away_team}</p>
    <p>Home: {game.home_team}</p>
    <Tabs initialSelectedTabIndex={0}>
        <TabList>
            <Tab>Moneyline</Tab>
            {#if $spreads.length !== 0}
                <Tab>Spreads</Tab>
            {/if}
            {#if $totals.length !== 0}
                <Tab>Totals</Tab>
            {/if}
        </TabList>
        <TabPanel>
            <h3>Moneyline</h3>
            <div class="wager-card">
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
            </div>
            <br />
        </TabPanel>
        {#if $spreads.length !== 0}
            <TabPanel>
                <h3>Spreads</h3>
                {#each $spreads as wager}  
                    <div class="wager-card">
                        <p>Away Spread: {parseFloat(wager.away_spread["$numberDecimal"])}</p>    
                        <p>Home Spread: {-parseFloat(wager.away_spread["$numberDecimal"])}</p>    
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
                    </div>
                    <br />
                {/each}
            </TabPanel>
        {/if}
        {#if $totals.length !== 0}
            <TabPanel>           
            <h3>Totals</h3>
                {#each $totals as wager}
                    <div class="wager-card">
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
                    </div>
                    <br />
                {/each}
            </TabPanel>
        {/if} 
    </Tabs>

{:else}
    <Link onClick={()=>selectedWager.set(null)}>Back to Wagers</Link>

    <h2>Place Bet</h2>

    <p>{getWagerDescription($selectedWager)}</p>

    {#if $priceInfo !== null}
        {#if $priceInfo.hasOwnProperty('odds')}
            <p>Percent: {$priceInfo.odds[$selectedWager.option_id]}</p>
        {:else}
            <p>No bets placed so far.</p>
        {/if}
    {:else}
        <p>Loading odds...</p>
    {/if}

    <div class="row align-center buttons">
        <BNInputField
            onInputChange={(value)=>placeBetInputValue.set(BN(value))}
            startingValue={startingValue}
            inputClass="primaryInput"
            labelClass="label"
            labelText="Your PHI Wager"
        />
        <br />
        {#if $placeBetErrors.length > 0}
            <br />
            <Errors errors={placeBetErrors} />
        {/if}
        {#if $lamden_vk === null}
            <p>Please connect your wallet.</p>
        {:else}
            <Button
                text={$placeBetInProgress ? "Betting..." : "Place Bet"}
                clicked={placeBet}
                disabled={$placeBetInProgress}
            />    
        {/if}
    </div>
{/if}