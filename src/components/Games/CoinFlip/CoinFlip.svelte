<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { coinFlipInputValue, phiCurrencyApprovedBalance, phiCurrencyBalance, coinFlipApprovalTxStatus, coinFlipTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../../../stores/lamdenStores.js';
    import { sendHouseApproval, sendCoinFlip } from '../../../js/lamden-utils.js'
    import PhiTokenBalance from '../../PhiTokenBalance.svelte'
    import BNInputField from '../../Inputs/BNInputField.svelte'
    import CoinAnimation from './CoinAnimation.svelte'
    import { stringToFixed } from '../../../js/global-utils'

    import RangeSlider from "svelte-range-slider-pips";

    $: connected = true; //$hasNetworkApproval.approved || false
    let startingValue = BN('10')

	onMount(() => {
        coinFlipInputValue.set(startingValue)
    })
    const status = writable("ready");
    const errors = writable(null);
    const odds = writable(0.5);

    function placeBet() {
        status.set('betting')
        errors.set(null)
        if (BN($phiCurrencyBalance).comparedTo(BN($coinFlipInputValue)) === -1) {
            errors.set(['You do not have enough PHI to make this bet.'])
            status.set('ready')
            return
        }
        if (BN($coinFlipInputValue).comparedTo(BN("1")) === -1 || BN("1000").comparedTo(BN($coinFlipInputValue)) === -1) {
            errors.set(['You can only bet between 1 and 1000 PHI'])
            status.set('ready')
            return
        }

        let afterApproval = () => {
            status.set('approved')
            sendCoinFlip($coinFlipInputValue, BN($odds), coinFlipTxStatus, (txResults)=>{
                if ($coinFlipTxStatus.errors?.length > 0) {
                    status.set('error')
                    errors.set($coinFlipTxStatus.errors)
                } else {
                    console.log(txResults.txBlockResult.state[1].value.__fixed__)
                    console.log(txResults.txBlockResult.state[3].value.__fixed__)
                    let previousPhi = BN($phiCurrencyBalance)
                    phiCurrencyApprovedBalance.set(BN(txResults.txBlockResult.state[0].value.__fixed__))
                    phiCurrencyBalance.set(BN(txResults.txBlockResult.state[1].value.__fixed__))
                    let currentPhi = BN($phiCurrencyBalance)
                    lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[3].value.__fixed__))
                    if (previousPhi.comparedTo(currentPhi) === -1) {
                        status.set('win')
                    } else {                            
                        status.set('loss')
                    }
                }
            })
        }
        if (BN($phiCurrencyApprovedBalance).comparedTo(BN($coinFlipInputValue)) === -1) {
            console.log("Requires approval");
            sendHouseApproval($coinFlipInputValue, coinFlipApprovalTxStatus, (txResults)=>{
                if ($coinFlipApprovalTxStatus.errors?.length > 0) {
                    status.set('error')
                    errors.set($coinFlipApprovalTxStatus.errors)
                } else {
                    afterApproval();
                }
            })
        } else {
            console.log("Preapproved!");
            afterApproval();
        }
    }
</script>


<style>
	.buttons{
		margin: 1rem auto 1rem;
        text-align: center;
	}
    .slider{
		width: 250px;
		margin: 1rem auto 1rem;
        text-align: center;
	}
    h2.buttons {
        margin-bottom: 2rem;
    }
    .coin-holder {
        margin-top: 1rem;
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
        labelText="Your Wager"
    />
</div>

<div class="row align-center slider">
    Set your own odds
    <RangeSlider 
        range={false}
        min={0.001}
        step={0.001}
        max={0.999}
        on:change={(e)=>odds.set(e.detail.value)}
    />
</div>

<div class="row align-center buttons">
    Odds of winning: 1/{stringToFixed(1/$odds, 4)}
</div>

<div class="row align-center buttons">
    Payout: {stringToFixed($coinFlipInputValue/$odds, 4)} PHI
</div>

<div class="coin-holder row align-center buttons">
    <CoinAnimation onClick={placeBet} status={status} />
</div>

<div class="row align-center buttons">
    Click the coin to spin
</div>

{#if $errors !== null}
    {#each $errors as error}
        <div class="row align-center buttons error">
            {error}
        </div>
    {/each}
{/if}

{/if}
