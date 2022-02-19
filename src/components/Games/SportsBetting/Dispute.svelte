<script>
import { onMount } from "svelte";
import { writable } from "svelte/store";
import { checkContractState } from "../../../js/lamden-utils";
import { lamden_vk } from "../../../stores/lamdenStores";
import Button from "../../Button.svelte";
import Errors from "../Poker/Errors.svelte";


export let disputeId, bet;

const contractName = writable(null);
const currentOptionId = writable(null);
const expectedOptionId = writable(null);
const voters = writable([]);
const duration = writable(null);
const description = writable(null);
const creator = writable(null);
const time = writable(null);
const result = writable(false);

onMount(()=>{
    getSportsBettingContract().then(w=>{
        contractName.set(w);
        checkContractState(w, 'dispute_details', [disputeId, 'current_option_id']).then(v=>{
            currentOptionId.set(v);
        })
        checkContractState(w, 'dispute_details', [disputeId, 'expected_option_id']).then(v=>{
            expectedOptionId.set(v);
        })
        checkContractState(w, 'dispute_details', [disputeId, 'time']).then(v=>{
            time.set(v);
        })
        checkContractState(w, 'dispute_details', [disputeId, 'dispute_creator']).then(v=>{
            creator.set(v);
        })
        checkContractState(w, 'dispute_details', [disputeId, 'description']).then(v=>{
            description.set(v);
        })
        checkContractState(w, 'dispute_details', [disputeId, 'duration']).then(v=>{
            duration.set(v);
        })
        checkContractState(w, 'dispute_details', [disputeId, 'voters'], []).then(v=>{
            voters.set(v);
        })
    })
})



const voteDisputeHandler = writable({});
const voteDisputeErrors = writable([]);
const voteDisputeInProgress = writable(false);
const voteDispute = async () => {
    voteDisputeInProgress.set(true);
    voteDisputeErrors.set([]);
    let kwargs = {
        function: 'vote_dispute',
        kwargs: {
            p_id: disputeId,
            result: $result,
        }
    }
    console.log("voteDispute")
    console.log(kwargs)
    sendDaoAction('sports_betting', kwargs, voteDisputeHandler, (txResults)=>{
        console.log("sendDaoAction")
        voteDisputeInProgress.set(false);
        if ($voteDisputeHandler.errors?.length > 0) {
            voteDisputeErrors.set($voteDisputeHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}


const determineResultsHandler = writable({});
const determineResultsErrors = writable([]);
const determineResultsInProgress = writable(false);
const determineResults = async () => {
    determineResultsInProgress.set(true);
    determineResultsErrors.set([]);
    let kwargs = {
        function: 'determine_dispute_results',
        kwargs: {
            p_id: disputeId,
        }
    }
    console.log("determineResults")
    console.log(kwargs)
    sendDaoAction('sports_betting', kwargs, determineResultsHandler, (txResults)=>{
        console.log("sendDaoAction")
        determineResultsInProgress.set(false);
        if ($determineResultsHandler.errors?.length > 0) {
            determineResultsErrors.set($determineResultsHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}

</script>

<h3>Dispute (#{disputeId})</h3>

<label>
    <input 
    type="radio"
    name="result"
    checked={$result}
    on:click={()=>result.set(true)}
    />
    Agree
</label>

<label>
    <input 
    type="radio"
    name="result"
    checked={!$result}
    on:click={()=>result.set(false)}
    />
    Disagree
</label>
<br />
{#if $voteDisputeErrors.length > 0}
    <Errors errors={voteDisputeErrors} />
{/if}
{#if $lamden_vk === null}
    <p>Please connect your wallet.</p>
{:else}
    <Button 
        clicked={()=>voteDispute()} 
        text={$voteDisputeInProgress ? "Voting..." : "Vote"}
        disabled={$voteDisputeInProgress}
    />    
{/if}

<h3>Results</h3>
<br />
{#if $determineResultsErrors.length > 0}
    <Errors errors={determineResultsErrors} />
{/if}
{#if $lamden_vk === null}
    <p>Please connect your wallet.</p>
{:else}
    <Button 
        clicked={()=>determineResults()} 
        text={$determineResultsInProgress ? "Determining..." : "Determine Results"}
        disabled={$determineResultsInProgress}
    />    
{/if}