<script>
import { onMount } from "svelte";

import { derived, writable } from "svelte/store";
import { checkContractState, getSportsBettingContract } from "../../../js/lamden-utils";
import { formatAwayScore, formatDate, formatHomeScore, formatTime, getWagerDescription } from "../../../js/sports-betting-provider";
import { lamden_vk } from "../../../stores/lamdenStores";
import Button from "../../Button.svelte";
import Link from "../../Link.svelte";
import Errors from "../Poker/Errors.svelte";
import CreateDisputeForm from "./CreateDisputeForm.svelte";
import Dispute from "./Dispute.svelte";


const contractName = writable(null);

onMount(()=>{
    getSportsBettingContract().then(w=>{
        contractName.set(w);
    })
})


const numBets = derived([lamden_vk, contractName], ([$lamden_vk, $contractName], set) => {
    if ($contractName === null) {
        set(0);
        return
    }
    if ($lamden_vk === null) {
        set(0);
        return
    }
    checkContractState($contractName, 'bets', [$lamden_vk, 'num_bets'], 0).then(v=>{
        set(v);
    })
});

const bets = derived([lamden_vk, numBets, contractName], ([$lamden_vk, $numBets, $contractName], set) => {
    if ($contractName === null) {
        set([])
        return
    } else if ($lamden_vk === null) {
        set([])
        return
    } else if ($numBets === null || $numBets === 0) {
        set([])
        return
    }
    const promises = []
    for (let i = $numBets-1; i >= 0; i--) {
        promises.push(new Promise((resolve, reject) => {
            checkContractState($contractName, 'bets', [$lamden_vk, 'bet', i, 'event_id'], null).then((event_id)=>{
                if (event_id !== null) {
                    let bet = {
                        event_id: event_id
                    };
                    checkContractState($contractName, 'bets', [$lamden_vk, 'bet', i, 'option_id'], null).then((option_id)=>{
                        bet = {
                            option_id: option_id,
                            ...bet
                        }
                        checkContractState($contractName, 'bets', [$lamden_vk, 'bet', i, 'amount'], null).then((amount)=>{
                            bet = {
                                amount: amount,
                                ...bet
                            }
                            checkContractState($contractName, 'events', [event_id, 'metadata', 'away_team'], null).then(away_team=>{
                                bet = {
                                    away_team: away_team,
                                    ...bet
                                }
                                checkContractState($contractName, 'events', [event_id, 'metadata', 'home_team'], null).then(home_team=>{
                                    bet = {
                                        home_team: home_team,
                                        ...bet
                                    }
                                    checkContractState($contractName, 'events', [event_id, 'metadata', 'sport'], null).then(sport=>{
                                        bet = {
                                            sport: sport,
                                            ...bet
                                        }
                                        checkContractState($contractName, 'events', [event_id, 'metadata', 'date'], null).then(date=>{
                                            bet = {
                                                date: date,
                                                ...bet
                                            }
                                            checkContractState($contractName, 'events', [event_id, 'metadata', 'timestamp'], null).then(timestamp=>{
                                                bet = {
                                                    timestamp: timestamp,
                                                    ...bet
                                                }
                                                checkContractState($contractName, 'events', [event_id, 'wager', 'name'], null).then(name=>{
                                                    bet = {
                                                        name: name,
                                                        ...bet
                                                    }
                                                    checkContractState($contractName, 'events', [event_id, 'wager', 'num_options'], null).then(num_options=>{
                                                        bet = {
                                                            num_options: num_options,
                                                            ...bet
                                                        }
                                                        checkContractState($contractName, 'events', [event_id, 'total', 'num_options'], null).then(total=>{
                                                            bet = {
                                                                total: total,
                                                                ...bet
                                                            }
                                                            checkContractState($contractName, 'events', [event_id, 'wager', 'spread'], null).then(spread=>{
                                                                bet = {
                                                                    spread: spread,
                                                                    ...bet
                                                                }
                                                                checkContractState($contractName, 'events', [event_id, 'winning_option_id'], null).then(winning_option_id=>{
                                                                    bet = {
                                                                        winning_option_id: winning_option_id,
                                                                        ...bet
                                                                    }
                                                                    resolve(bet)
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                } else {
                    resolve(null)
                }
            })
        }))
    }
    Promise.all(promises).then(values=>set(values));
})


const claimBetHandler = writable({});
const claimBetErrors = writable([]);
const claimBetInProgress = writable(false);
const claimBet = async (bet) => {
    const contract = $contractName;
    if (contract === null) {
        alert("Could not find sports betting contract.")
        return;
    }    
    claimBetInProgress.set(true);
    claimBetErrors.set([]);
    let kwargs = {
        function: 'claim_bet',
        kwargs: {
            event_id: bet.event_id,
            option_id: bet.option_id
        }
    }
    console.log("claimBet")
    console.log(kwargs)
    sendDaoAction('sports_betting', kwargs, claimBetHandler, (txResults)=>{
        console.log("sendDaoAction")
        claimBetInProgress.set(false);
        if ($claimBetHandler.errors?.length > 0) {
            claimBetErrors.set($claimBetHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}

const createDisputeToggle = writable(null);
const showDisputeToggle = writable(null);

</script>

{#each $bets as bet}

    <p>Local Date: {formatDate(bet.timestamp)}</p>
    <p>Local Time: {formatTime(bet.timestamp)}</p>
    {#if typeof bet.winningOptionId !== 'undefined' && bet.winningOptionId !== null}
        <p>Away: {bet.away_team} - {formatAwayScore(bet)}</p>
        <p>Home: {bet.home_team} - {formatHomeScore(bet)}</p>
        <br />
        {#if $claimBetErrors.length > 0}
            <br />
            <Errors errors={claimBetErrors} />
        {/if}
        {#if $lamden_vk === null}
            <p>Please connect your wallet.</p>
        {:else}
            {#if bet.winningOptionId === bet.option_id}
                <Button 
                    clicked={()=>claimBet(bet)} 
                    text={$claimBetInProgress ? "Claiming..." : "Claim"}
                    disabled={$claimBetInProgress}
                />
            {:else}
                <p>You Lost :(</p>                
            {/if}
            {#if typeof bet.dispute !== 'undefined' && bet.dispute !== null}
                {#if $showDisputeToggle === bet.dispute}
                    <Link onClick={()=>showDisputeToggle.set(null)}>Hide Dispute</Link>
                    <br />
                    <Dispute disputeId={bet.dispute} bet={bet}/>
                {:else}
                    <Link onClick={()=>showDisputeToggle.set(bet.dispute)}>Show Dispute</Link>
                {/if}
            {:else}
                Create Dispute
                {#if $createDisputeToggle === bet.dispute}
                    <Link onClick={()=>createDisputeToggle.set(null)}>Hide Dispute</Link>
                    <br />
                    <CreateDisputeForm bet={bet}/>
                {:else}
                    <Link onClick={()=>createDisputeToggle.set(bet.dispute)}>Create Dispute</Link>
                {/if}
            {/if}
        {/if}
    {:else}
        <p>Away: {bet.away_team}</p>
        <p>Home: {bet.home_team}</p>
    {/if}
    <p>{getWagerDescription(bet, bet)}</p>
    <p>Amount: {bet.amount}</p>



{/each}
