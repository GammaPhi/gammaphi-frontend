<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { coinFlipInputValue, phiCurrencyBalance, coinFlipApprovalTxStatus, coinFlipTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../../stores/lamdenStores.js';
    import { sendCoinFlipApproval, sendCoinFlip } from '../../js/lamden-utils.js'
    import PhiTokenBalance from '../PhiTokenBalance.svelte'
    import BNInputField from '../Inputs/BNInputField.svelte'
    import CoinAnimation from './CoinFlip/CoinAnimation.svelte'

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
                        let previousPhi = BN($phiCurrencyBalance)
                        phiCurrencyBalance.set(BN(txResults.txBlockResult.state[1].value.__fixed__))
                        let currentPhi = BN($phiCurrencyBalance)
                        lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[3].value.__fixed__))
                        if (previousPhi < currentPhi) {
                            status.set('win')
                        } else {                            
                            status.set('loss')
                        }
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
    Feeling Lucky?
</h2>

{#if connected}
<div class="row align-center buttons">
    <BNInputField 
        onInputChange={(value)=>coinFlipInputValue.set(value)}
        startingValue={startingValue}
        inputClass="primaryInput"
        labelClass="label"
        labelText="Amount to Bet"
    />
</div>

<div class="row align-center buttons">
    <CoinAnimation onClick={placeBet} status={status} />
</div>

{#if $errors !== null}
    {#each $errors as error}
        <div class="row align-center buttons error">
            {error}
        </div>
    {/each}
{/if}

<div class="row align-center buttons">
    <PhiTokenBalance />
</div>
{/if}
