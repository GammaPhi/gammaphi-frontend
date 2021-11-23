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
    const btnEnabled = derived(status, ($status)=>$status === 'ready' || $status === 'error');

    function purchasePhi(round) {
        status.set('betting')
        errors.set(null)
        var phiPerTau;
        if (round === 1) {
            phiPerTau = phiPerTauR1;
        } else {
            phiPerTau = phiPerTauR2;
        }
        console.log("purchasing");
        sendPhiPurchaseApproval($purchasePhiInputValue/phiPerTau, lamdenApprovalTxStatus, (txResults)=>{
            console.log("approval");
            console.log($lamdenApprovalTxStatus);
            if ($lamdenApprovalTxStatus.errors?.length > 0) {
                status.set('error')
                errors.set($lamdenApprovalTxStatus.errors)
            } else {
                status.set('approved')
                sendPhiPurchase($purchasePhiInputValue/phiPerTau, round, purchasePhiTxStatus, (txResults)=>{
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
</style>

<div class="card">
    <h2 class="round1 row align-center buttons">
        Round 1 (1 TAU == {phiPerTauR1} PHI)
    </h2>

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

        <div class="row align-center">
            <button on:click={()=>purchasePhi(1)} disabled={!$btnEnabled}>
                {#if $btnEnabled}
                Purchase
                {:else}
                Purchasing...
                {/if}
            </button>
        </div>
    {:else}
        <div class="row align-center">
            <button disabled={true}>Sold Out</button>
        </div>
    {/if}

</div>

<div class="card">

    <h2 class="row align-center buttons round2">
        Round 2 (1 TAU == {phiPerTauR2} PHI)
    </h2>

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
        <div class="row align-center">
            <button on:click={()=>purchasePhi(2)} disabled={!$btnEnabled}>
                {#if $btnEnabled}
                Purchase
                {:else}
                Purchasing...
                {/if}
            </button>
        </div>
        {:else}
        <div class="row align-center">
            <button disabled={true}>Sold Out</button>
        </div>
        {/if}
    {/if}

</div>