<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { purchasePhiInputValue, phiCurrencyBalance, lamdenApprovalTxStatus, purchasePhiTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../stores/lamdenStores.js';
    import { sendPhiPurchaseApproval, sendPhiPurchase, checkContractVariable } from '../js/lamden-utils.js'
    import PhiTokenBalance from './PhiTokenBalance.svelte'
    import BNInputField from './Inputs/BNInputField.svelte'

    $: connected = true; //$hasNetworkApproval.approved || false
    let startingValue = BN('1000')
    let remainingPhi = writable(BN('0'))
    const phiPerTau = 500;

	onMount(async () => {
        purchasePhiInputValue.set(startingValue)
        remainingPhi.set(await checkContractVariable("con_gamma_phi_sales_v1", "round_1_quantity"))
    })
    const status = writable("ready");
    const errors = writable(null);

    function purchasePhi() {
        status.set('betting')
        errors.set(null)
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
    Purchase PHI (1 TAU == {phiPerTau} PHI)
</h2>

<h3 class="row align-center buttons">
    PHI Available: {$remainingPhi}
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

{/if}
