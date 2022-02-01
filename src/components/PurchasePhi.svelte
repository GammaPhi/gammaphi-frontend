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

    const phiPerTauR2 = 100;

	onMount(() => {
        purchasePhiInputValue.set(startingValue)
    })
    const status = writable("ready");
    const errors = writable(null);
    const btnEnabled = derived(status, ($status)=>$status === 'ready' || $status === 'error');

    function purchasePhi() {
        status.set('betting')
        errors.set(null)
        var phiPerTau;
        phiPerTau = phiPerTauR2;
        console.log("purchasing");
        sendPhiPurchaseApproval($purchasePhiInputValue/phiPerTau, lamdenApprovalTxStatus, (txResults)=>{
            console.log("approval");
            console.log($lamdenApprovalTxStatus);
            if ($lamdenApprovalTxStatus.errors?.length > 0) {
                status.set('error')
                errors.set($lamdenApprovalTxStatus.errors)
            } else {
                status.set('approved')
                sendPhiPurchase($purchasePhiInputValue/phiPerTau, 2, purchasePhiTxStatus, (txResults)=>{
                    if ($purchasePhiTxStatus.errors?.length > 0) {
                        status.set('error')
                        errors.set($purchasePhiTxStatus.errors)
                    } else {
                        console.log(txResults.txBlockResult.state[0].value.__fixed__)
                        console.log(txResults.txBlockResult.state[5].value.__fixed__)
                        console.log(txResults.txBlockResult.state[2].value.__fixed__)
                        phiCurrencyBalance.set(BN(txResults.txBlockResult.state[5].value.__fixed__))
                        lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[2].value.__fixed__))
                        remainingPhiR2.set(BN(txResults.txBlockResult.state[0].value.__fixed__))
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
    <h2>Presale</h2>
    <h3 class="row align-center buttons">
        SOLD OUT
    </h3>
</div>

<div class="card">
    <h2>Sale</h2>
    <h3 class="row align-center buttons round2">
        1 TAU == {phiPerTauR2} PHI
    </h3>

    <h4 class="row align-center buttons">
        Remaining: {$remainingPhiR2} PHI
    </h4>

    <div class="row align-center buttons">
        <BNInputField 
            onInputChange={(value)=>purchasePhiInputValue.set(value)}
            startingValue={startingValue}
            inputClass="primaryInput"
            labelClass="label"
            labelText="Amount of PHI to purchase"
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
        <button on:click={()=>purchasePhi()} disabled={!$btnEnabled}>
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