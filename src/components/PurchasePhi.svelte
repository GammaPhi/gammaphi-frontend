<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { remainingPhiR1, remainingPhiR2, purchasePhiInputValue, phiCurrencyBalance, lamdenApprovalTxStatus, purchasePhiTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../stores/lamdenStores.js';
    import { sendPhiPurchaseApproval, sendPhiPurchase } from '../js/lamden-utils.js'
    import PhiTokenBalance from './PhiTokenBalance.svelte'
    import BNInputField from './Inputs/BNInputField.svelte'

    let startingValue = BN('1000')

    const phiPerTauR1 = 500;
    const phiPerTauR2 = 250;

	onMount(() => {
        purchasePhiInputValue.set(startingValue)
    })
    const status = writable("ready");
    const errors = writable(null);

    function purchasePhi(round) {
        status.set('betting')
        errors.set(null)
        var phiPerTau;
        if (round === 1) {
            phiPerTau = phiPerTauR1;
        } else {
            phiPerTau = phiPerTauR2;
        }
        sendPhiPurchaseApproval($purchasePhiInputValue/phiPerTau, lamdenApprovalTxStatus, (txResults)=>{
            if ($lamdenApprovalTxStatus.errors?.length > 0) {
                status.set('error')
                errors.set($lamdenApprovalTxStatus.errors)
            } else {
                status.set('approved')
                sendPhiPurchase($purchasePhiInputValue/phiPerTau, purchasePhiTxStatus, (txResults)=>{
                    if ($purchasePhiTxStatus.errors?.length > 0) {
                        status.set('error')
                        errors.set($purchasePhiTxStatus.errors)
                    } else {
                        console.log(txResults.txBlockResult.state[0].value.__fixed__)
                        console.log(txResults.txBlockResult.state[5].value.__fixed__)
                        console.log(txResults.txBlockResult.state[2].value.__fixed__)
                        phiCurrencyBalance.set(BN(txResults.txBlockResult.state[5].value.__fixed__))
                        lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[2].value.__fixed__))
                        if (round === 1) {
                            remainingPhiR1.set(BN(txResults.txBlockResult.state[0].value.__fixed__))
                        } else {
                            remainingPhiR2.set(BN(txResults.txBlockResult.state[0].value.__fixed__))
                        }
                        status.set('ready')
                    }
                })
            }
        })
    }
    
</script>


<style>
	.buttons{
		width: max-content;
		margin: 1rem auto 1rem;
        text-align: center;
	}
    h2.buttons, h3.buttons {
        margin-bottom: 2rem;
    }
    .round1 {
        margin-top: 3rem;
    }
    .round2 {
        margin-top: 3rem;
    }
</style>

<h2 class="row align-center buttons">
    Purchase PHI
</h2>

<h3 class="round1 row align-center buttons">
    Round 1 (1 TAU == {phiPerTauR1} PHI)
</h3>

{#if $remainingPhiR1 !== BN(0)}

<h3 class="row align-center buttons">
    Remaining: {$remainingPhiR1} PHI
</h3>

<div class="row align-center buttons">
    <BNInputField 
        onInputChange={(value)=>purchasePhiInputValue.set(value)}
        startingValue={startingValue}
        inputClass="primaryInput"
        labelClass="label"
        labelText="How many PHI would you like to purchase?"
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
    <button on:click={()=>purchasePhi(1)}>Purchase</button>
</div>
{:else}
<div class="row align-center buttons">
    <button disabled={true}>Sold Out</button>
</div>
{/if}



<h3 class="row align-center buttons round2">
    Round 2 (1 TAU == {phiPerTauR2} PHI)
</h3>

<h3 class="row align-center buttons">
    Remaining: {$remainingPhiR2} PHI
</h3>

{#if $remainingPhiR1 !== BN(0)}
<p>
    Round 2 hasn't started yet.
</p>
{:else}
<div class="row align-center buttons">
    <BNInputField 
        onInputChange={(value)=>purchasePhiInputValue.set(value)}
        startingValue={startingValue}
        inputClass="primaryInput"
        labelClass="label"
        labelText="How many PHI would you like to purchase?"
    />
</div>

{#if $errors !== null}
    {#each $errors as error}
        <div class="row align-center buttons error">
            {error}
        </div>
    {/each}
{/if}

{#if $remainingPhiR2 !== BN(0)}
<div class="row align-center buttons">
    <button on:click={()=>purchasePhi(2)}>Purchase</button>
</div>
{:else}
<div class="row align-center buttons">
    <button disabled={true}>Sold Out</button>
</div>
{/if}
{/if}
