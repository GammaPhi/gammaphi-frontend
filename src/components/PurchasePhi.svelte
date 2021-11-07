<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { purchasePhiInputValue, phiCurrencyBalance, lamdenApprovalTxStatus, purchasePhiTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../stores/lamdenStores.js';
    import { sendLamdenApproval, sendPhiPurchase } from '../js/lamden-utils.js'
    import PhiTokenBalance from './PhiTokenBalance.svelte'
    import { checkTokenBalance } from '../js/lamden-utils'
    import { stringToFixed, determinePrecision } from '../js/global-utils'
    import BNInputField from './Inputs/BNInputField.svelte'

    $: connected = true; //$hasNetworkApproval.approved || false
    let startingValue = BN('100')

	onMount(() => {
        purchasePhiInputValue.set(startingValue)
    })
    const status = writable("ready");
    const errors = writable(null);

    function purchasePhi() {
        status.set('betting')
        errors.set(null)
        sendLamdenApproval($purchasePhiInputValue, lamdenApprovalTxStatus, (txResults)=>{
            if ($lamdenApprovalTxStatus.errors?.length > 0) {
                status.set('error')
                errors.set($lamdenApprovalTxStatus.errors)
            } else {
                status.set('approved')
                sendPhiPurchase($purchasePhiInputValue, purchasePhiTxStatus, (txResults)=>{
                    if ($purchasePhiTxStatus.errors?.length > 0) {
                        status.set('error')
                        errors.set($purchasePhiTxStatus.errors)
                    } else {
                        console.log(txResults.txBlockResult.state[4].value.__fixed__)
                        console.log(txResults.txBlockResult.state[2].value.__fixed__)
                        phiCurrencyBalance.set(BN(txResults.txBlockResult.state[4].value.__fixed__))
                        lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[2].value.__fixed__))
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
    h2.buttons {
        margin-bottom: 2rem;
    }
</style>

<h2 class="row align-center buttons">
    Purchase PHI (1 TAU == 100 PHI)
</h2>

{#if connected}
<div class="row align-center buttons">
    <BNInputField 
        onInputChange={(value)=>purchasePhiInputValue.set(value)}
        startingValue={startingValue}
        inputClass="primaryInput"
        labelClass="label"
        labelText="How many TAU do you want to spend?"
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
