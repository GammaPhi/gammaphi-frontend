<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { coinFlipInputValue, phiCurrencyBalance, coinFlipApprovalTxStatus, coinFlipTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../../stores/lamdenStores.js';
    import { sendCoinFlipApproval, sendCoinFlip } from '../../js/lamden-utils.js'
    import PhiTokenBalance from '../PhiTokenBalance.svelte'
    import { checkTokenBalance } from '../../js/lamden-utils'
    import { stringToFixed, determinePrecision } from '../../js/global-utils'

    $: connected = true; //$hasNetworkApproval.approved || false
    let startingValue = BN('10')

	onMount(() => {
        coinFlipInputValue.set(startingValue)
    })
    const status = writable("ready");
    const errors = writable(null);

    function placeBet() {
        status.set('betting')
        errors.set(null)
        sendCoinFlipApproval($coinFlipInputValue, coinFlipApprovalTxStatus, (txResults)=>{
            if ($coinFlipApprovalTxStatus.errors?.length > 0) {
                status.set('error')
                errors.set($coinFlipApprovalTxStatus.errors)
            } else {
                status.set('approved')
                sendCoinFlip($coinFlipInputValue, coinFlipTxStatus, (txResults)=>{
                    if ($coinFlipTxStatus.errors?.length > 0) {
                        status.set('error')
                        errors.set($coinFlipTxStatus.errors)
                    } else {
                        console.log(txResults.txBlockResult.state[1].value.__fixed__)
                        console.log(txResults.txBlockResult.state[3].value.__fixed__)
                        phiCurrencyBalance.set(txResults.txBlockResult.state[1].value.__fixed__)
                        lamdenCurrencyBalance.set(txResults.txBlockResult.state[3].value.__fixed__)
                        status.set('ready')
                    }
                })
            }
        })
    }
    
    // DOM ELEMENT BINDINGS
    let inputElm;
    const handleInputChange = (e) => {
        let validateValue = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
        if (validateValue !== e.target.value) {
            inputElm.value = validateValue
        }else{
            let value = new BN(e.target.value)
            if (determinePrecision(value) > 8){
                value = new BN(stringToFixed(value, 8))
                inputElm.value = stringToFixed(value, 8)
            }
        }
        coinFlipInputValue.set(inputElm.value)
    }
</script>


<style>
	.buttons{
		width: max-content;
		margin: 1rem auto 1rem;
        text-align: center;
	}
    .primaryInput {
        margin-top: 1rem;
    }
    h2.buttons {
        margin-bottom: 2rem;
    }
</style>

<h2 class="row align-center buttons">
    Feeling Lucky?
</h2>

{#if connected}
<div class="row align-center buttons">
    <label class="label">Amount to Bet <br/>
    <input class="primaryInput"
        bind:this={inputElm}
        on:input={handleInputChange}
        value={startingValue}
        readonly={false}
    /></label>
</div>

{#if $errors !== null}
    {#each $errors as error}
        <div class="row align-center buttons error">
            {error}
        </div>
    {/each}
{/if}

<div class="row align-center buttons">
    <button on:click={placeBet}>Flip</button>
</div>
<div class="row align-center buttons">
    <PhiTokenBalance />
</div>
{/if}
