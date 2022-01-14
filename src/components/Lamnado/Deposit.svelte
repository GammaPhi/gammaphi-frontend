<script>
import { onMount } from "svelte";
import { createRandomDeposit, toHex, createNote, sendTokenApproval, lamnadoDeposit } from '../../js/lamnado'
import { derived, writable } from "svelte/store";
import { lamdenNetwork } from "../../stores/globalStores";
import Container from "../Inputs/Container.svelte";
import Button from "../Button.svelte";
import Errors from "../Games/Poker/Errors.svelte";
import BN from 'bignumber.js'


const tokens = ['PHI', 'TAU']
const denominations = {
    PHI: ['1000'],//, '10000', '100000', '1000000'],
    TAU: ['1000']//, '1000', '10000', '100000'],
}
const symbols = {
    PHI: 'phi',
    TAU: 'currency',
}
const contracts = {
    PHI: {
        '1000': 'con_lamnado_phi_1000_v1'
    },
    TAU: {
        '100': 'con_lamnado_currency_1000_v1'
    }
}


const token = writable(tokens[0])
const amount = writable(denominations[tokens[0]][0])
const deposit = writable(null)
const note = derived([amount, token, deposit], ([$amount, $token, $deposit]) => {
    if ($deposit === null) {
        return null;
    }
    return createNote($amount, symbols[$token], $deposit)
})


const downloaded = new writable(false);

onMount(() => {
    downloaded.set(false)
    deposit.set(createRandomDeposit())
    return () => {
        deposit.set(null)
        downloaded.set(false)
    }
});


const downloadNote = () => {
    const url = window.URL.createObjectURL(new Blob([$note]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lamnado-note-${Math.floor(Date.now() / 1000)}.txt`);
    document.body.appendChild(link);
    link.click();
    downloaded.set(true);
}
    

const depositHandler = writable({});
const depositApprovalHandler = writable({});
const depositErrors = writable([]);
const depositInProgress = writable(false);
const depositFunc = async () => {
    // add_chips_to_game
    depositInProgress.set(true);
    depositErrors.set([]);
    sendTokenApproval(BN($amount), contracts[$token][$amount.toString()], depositApprovalHandler, (txResults)=>{
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

<style>
.note {
    overflow-wrap: anywhere;
}

</style>

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
    <div class="note">
        {#if $note !== null}
            {$note.substring(0, 20)}...{$note.substring($note.length-20)}
        {/if}
    </div>
    <br /><br />
    <Button
        text={"Download Note"}
        clicked={downloadNote}
    /><br /><br />
    <Errors errors={depositErrors} />
    <Button
        text={$depositInProgress ? "Depositing..." : "Deposit"}
        clicked={depositFunc}
        disabled={$depositInProgress || !$downloaded}
    />
    <br /><br />
</Container>
