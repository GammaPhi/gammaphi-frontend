<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { purchasePhiInputValue, phiCurrencyBalance, lamdenApprovalTxStatus, purchasePhiTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../stores/lamdenStores.js';
    import { sendLamdenApproval, sendPhiPurchase, checkContractVariable } from '../js/lamden-utils.js'
    import PhiTokenBalance from './PhiTokenBalance.svelte'
    import BNInputField from './Inputs/BNInputField.svelte'

    $: connected = true; //$hasNetworkApproval.approved || false
    let startingValue = BN('1000')
    let remainingPhi = writable(BN('0'))

	onMount(async () => {
        purchasePhiInputValue.set(startingValue)
        remainingPhi.set(await checkContractVariable("round_1_quantity"))
    })
    const status = writable("ready");
    const errors = writable(null);

    function purchasePhi() {
        status.set('betting')
        errors.set(null)
        sendLamdenApproval($purchasePhiInputValue/100, lamdenApprovalTxStatus, (txResults)=>{
            if ($lamdenApprovalTxStatus.errors?.length > 0) {
                status.set('error')
                errors.set($lamdenApprovalTxStatus.errors)
            } else {
                status.set('approved')
                sendPhiPurchase($purchasePhiInputValue/100, purchasePhiTxStatus, (txResults)=>{
                    if ($purchasePhiTxStatus.errors?.length > 0) {
                        status.set('error')
                        errors.set($purchasePhiTxStatus.errors)
                    } else {
                        console.log(txResults.txBlockResult.state[0].value.__fixed__)
                        console.log(txResults.txBlockResult.state[4].value.__fixed__)
                        console.log(txResults.txBlockResult.state[2].value.__fixed__)
                        phiCurrencyBalance.set(BN(txResults.txBlockResult.state[4].value.__fixed__))
                        lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[2].value.__fixed__))
                        remainingPhi.set(BN(txResults.txBlockResult.state[0].value.__fixed__))
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
</style>

<h2 class="row align-center buttons">
    Purchase PHI (1 TAU == 100 PHI)
</h2>

<h3 class="row align-center buttons">
    Remaining PHI available for purchase: {$remainingPhi}
</h3>

{#if connected}
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
    <button on:click={purchasePhi}>Purchase</button>
</div>
<div class="row align-center buttons">
    <PhiTokenBalance />
</div>
{/if}
