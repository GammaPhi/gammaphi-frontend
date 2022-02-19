<script>
import { lamden_vk } from "../../../stores/lamdenStores";
import Button from "../../Button.svelte";
import { onMount } from "svelte";
import { writable } from "svelte/store";
import { checkContractState } from "../../../js/lamden-utils";
import Errors from "../Poker/Errors.svelte";


export let bet;


const expectedOptionId = writable(bet.option_id);
const description = writable(null);


const createDisputeHandler = writable({});
const createDisputeErrors = writable([]);
const createDisputeInProgress = writable(false);
const createDispute = async () => {
    createDisputeInProgress.set(true);
    createDisputeErrors.set([]);
    let kwargs = {
        function: 'create_dispute',
        kwargs: {
            event_id: bet.event_id,
            current_option_id: bet.winning_option_id,
            expected_option_id: $expectedOptionId,
            description: $description
        }
    }
    console.log("createDispute")
    console.log(kwargs)
    sendDaoAction('sports_betting', kwargs, createDisputeHandler, (txResults)=>{
        console.log("sendDaoAction")
        createDisputeInProgress.set(false);
        if ($createDisputeHandler.errors?.length > 0) {
            createDisputeErrors.set($createDisputeHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}


</script>


<h3>Create Dispute</h3>


<p>Expected Outcome</p>
<label>
    <input 
    type="radio"
    name="winner"
    checked={$expectedOptionId === 0}
    on:click={()=>expectedOptionId.set(0)}
    />
    {bet.away_team}
</label>
<label>
    <input 
    type="radio"
    name="winner"
    checked={$expectedOptionId === 1}
    on:click={()=>expectedOptionId.set(1)}
    />
    {bet.home_team}
</label>
{#if bet.num_options === 3}
    <label>
        <input 
        type="radio"
        name="winner"
        checked={$expectedOptionId === 2}
        on:click={()=>expectedOptionId.set(2)}
        />
        Draw
    </label>
{/if}
<label>
    <input 
    type="radio"
    name="winner"
    checked={$expectedOptionId === -1}
    on:click={()=>expectedOptionId.set(-1)}
    />
    No Bet
</label>


<br />

<p>Dispute Description</p>
<textarea 
    value={$description}
    on:change={(e)=>description.set(e.target.value)}
    on:input={(e)=>description.set(e.target.value)}
    rows={4}
/><br />
<br />
{#if $createDisputeErrors.length > 0}
    <Errors errors={createDisputeErrors} />
{/if}
{#if $lamden_vk === null}
    <p>Please connect your wallet.</p>
{:else}
    <Button 
        clicked={()=>createDispute()} 
        text={$createDisputeInProgress ? "Creating..." : "Create"}
        disabled={$createDisputeInProgress}
    />    
{/if}
