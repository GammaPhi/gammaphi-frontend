<script>
import BN from 'bignumber.js'
import { onMount, getContext } from 'svelte';
import { writable, derived, get } from "svelte/store";
import BnInputField from '../components/Inputs/BNInputField.svelte';
import { sendCoinFlipApproval } from '../js/lamden-utils';
import { phiCurrencyBalance, lamdenCurrencyBalance, phiCurrencyApprovedBalance } from '../stores/lamdenStores';

let startingValue = BN('1000')
let approvalInputValue = writable(BN('0'));
const errors = writable(null);
const status = writable("ready");
const btnEnabled = derived(status, ($status)=>$status === 'ready' || $status === 'error');
const approvalTxStatus = writable({})

onMount(() => {
    approvalInputValue.set(startingValue)
})

function approve() {
    status.set('betting')
    errors.set(null)
    if (BN($phiCurrencyBalance) < BN($approvalInputValue)) {
        errors.set(['You do not have enough PHI to make this bet.'])
        status.set('ready')
        return
    } 
    sendCoinFlipApproval($approvalInputValue, approvalTxStatus, (txResults)=>{
        if ($approvalTxStatus.errors?.length > 0) {
            status.set('error')
            errors.set($approvalTxStatus.errors)
        } else {
            console.log(txResults);
            console.log($approvalTxStatus);
            phiCurrencyApprovedBalance.set(BN(txResults.txBlockResult.state[0].value.__fixed__))
            lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[1].value.__fixed__))
            status.set("ready");
        }
    });
};

</script>

<div align="middle" class="card">
<h2>Pre-approve $PHI</h2>
<p>
By pre-approving $PHI, you can significantly speed up gameplay. This applies to the Dice Roll, Coin Flip, and Wheel Spin games.
</p>
<br/>
<div class="row align-center buttons">
    <BnInputField
        onInputChange={(value)=>approvalInputValue.set(value)}
        startingValue={startingValue}
        inputClass="primaryInput"
        labelClass="label"
        labelText="How much PHI to Approve"
    />
</div>
{#if $errors !== null}
    {#each $errors as error}
        <div class="row align-center buttons error">
            {error}
        </div>
    {/each}
{/if}
<div class="row align-center buttons">
    <button on:click={approve} disabled={!$btnEnabled}>
    {#if $btnEnabled}
        Approve
    {:else}
        Approving...
    {/if}
    </button>
</div>
</div>

<style>
	.buttons{
		margin: 1rem auto 1rem;
        text-align: center;
	}
</style>
    