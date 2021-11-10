<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { lotteryBalance, lotteryInputValue, phiCurrencyBalance, lotteryApprovalTxStatus, lotteryTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../../../stores/lamdenStores.js';
    import { checkLotteryTotal, sendLotteryApproval, sendLottery } from '../../../js/lamden-utils.js'
    import PhiTokenBalance from '../../PhiTokenBalance.svelte'
    import BNInputField from '../../Inputs/BNInputField.svelte'
    import { stringToFixed } from '../../../js/global-utils'

    $: connected = true; //$hasNetworkApproval.approved || false
    let startingValue = new BN('10')
    let currentJackpot = writable(new BN(0))

	onMount(async () => {
        lotteryInputValue.set(startingValue)
        currentJackpot.set(await checkLotteryTotal())
    })
    const status = writable("ready");
    const errors = writable(null);

    function getTickets() {
        status.set('betting')
        errors.set(null)
        if (BN($phiCurrencyBalance) < BN($lotteryInputValue)) {
            errors.set(['You do not have enough PHI to make this bet.'])
            status.set('ready')
            return
        }        
        sendLotteryApproval($lotteryInputValue, lotteryApprovalTxStatus, (txResults)=>{
            if ($lotteryApprovalTxStatus.errors?.length > 0) {
                status.set('error')
                errors.set($lotteryApprovalTxStatus.errors)
            } else {
                status.set('approved')
                sendLottery($lotteryInputValue, lotteryTxStatus, (txResults)=>{
                    if ($lotteryTxStatus.errors?.length > 0) {
                        status.set('error')
                        errors.set($lotteryTxStatus.errors)
                    } else {
                        console.log(txResults.txBlockResult.state[1].value.__fixed__)
                        console.log(txResults.txBlockResult.state[3].value.__fixed__)
                        console.log(txResults.txBlockResult.state[4].value.__fixed__)
                        phiCurrencyBalance.set(BN(txResults.txBlockResult.state[1].value.__fixed__))
                        lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[3].value.__fixed__))  
                        lotteryBalance.set(BN(txResults.txBlockResult.state[4].value.__fixed__))                   
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
    Current Jackpot: {$currentJackpot} PHI
</h2>

{#if connected}
<div align="center" class="row align-center buttons">
    <BNInputField
        onInputChange={(value)=>lotteryInputValue.set(value)}
        startingValue={startingValue}
        inputClass="primaryInput"
        labelClass="label"
        labelText="How many lottery tickets do you want?"
    />
</div>


<div align="center" class="row align-center buttons">
    <button on:click={getTickets} >Buy</button>
</div>

{#if $errors !== null}
    {#each $errors as error}
        <div class="row align-center buttons error">
            {error}
        </div>
    {/each}
{/if}

<div class="row align-center buttons">
    You currently have {$lotteryBalance} lottery tickets
</div>

{/if}
