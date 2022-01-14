<script>
import { onMount } from "svelte";
import { createRandomDeposit, toHex, createNote, sendTokenApproval, lamnadoDeposit } from '../../js/lamnado'
import { derived, writable } from "svelte/store";
import { lamdenNetwork } from "../../stores/globalStores";
import Container from "../Inputs/Container.svelte";
import Button from "../Button.svelte";
import Errors from "../Games/Poker/Errors.svelte";

const tokens = ['PHI', 'TAU']
const denominations = {
    PHI: ['1000', '10000', '100000', '1000000'],
    TAU: ['100', '1000', '10000', '100000'],
}
const symbols = {
    PHI: 'phi',
    TAU: 'currency',
}

const token = writable(tokens[0])
const amount = writable('1000000')
const deposit = writable(null)
const note = derived([amount, token, deposit], ([$amount, $token, $deposit]) => {
    if ($deposit === null) {
        return null;
    }
    return createNote($amount, $token, $deposit)
})
const contracts = derived([lamdenNetwork], ([$lamdenNetwork]) => {
    return $lamdenNetwork.lamnado_contracts
})



onMount(() => {
    deposit.set(createRandomDeposit())
});

const depositHandler = writable({});
const depositApprovalHandler = writable({});
const depositErrors = writable([]);
const depositInProgress = writable(false);
const depositFunc = async () => {
    // add_chips_to_game
    depositInProgress.set(true);
    depositErrors.set([]);
    sendTokenApproval(BN($amount), contracts[$token], depositApprovalHandler, (txResults)=>{
        if ($depositApprovalHandler.errors?.length > 0) {
            depositInProgress.set(false);
            depositErrors.set($depositApprovalHandler.errors)
        } else {
            lamnadoDeposit($amount, symbols[$token], $deposit, depositHandler, (txResults)=>{
                depositInProgress.set(false);
                if ($depositHandler.errors?.length > 0) {
                    depositErrors.set($depositHandler.errors)
                } else {
                    console.log("Success");
                    console.log(txResults);
                }
            });
        }
    })
}

</script>


<h2>Deposit</h2>


<Container>
    <p>Token</p>
    {#each tokens as t}
        <label>
            <input 
            type="radio"
            name="token"
            checked={$token === t}
            on:click={()=>token.set(t)}
            />
            {t}
        </label>
    {/each}
    <br /><br />
    <p>Amount</p>
    {#each denominations[$token] as t}
        <label>
            <input 
            type="radio"
            name="denomination"
            checked={$amount === t}
            on:click={()=>amount.set(t)}
            />
            {t}
        </label>
    {/each}
    <br /><br />
    <p>Your Note</p>
    <div>
        {#if $note !== null}
            {$note}
        {/if}
    </div>
    <br /><br />
    <Errors errors={depositErrors} />
    <Button
        text={$depositInProgress ? "Depositing..." : "Deposit"}
        clicked={depositFunc}
        disabled={$depositInProgress}
    />
    <br /><br />
</Container>
