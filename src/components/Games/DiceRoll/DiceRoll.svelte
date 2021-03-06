<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { diceRollInputValue, phiCurrencyApprovedBalance, phiCurrencyBalance, diceRollApprovalTxStatus, diceRollTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../../../stores/lamdenStores.js';
    import { sendHouseApproval, sendDiceRoll } from '../../../js/lamden-utils.js'
    import PhiTokenBalance from '../../PhiTokenBalance.svelte'
    import BNInputField from '../../Inputs/BNInputField.svelte'
    import { stringToFixed } from '../../../js/global-utils'
    import Dice from './Dice.svelte'

    $: connected = true; //$hasNetworkApproval.approved || false
    let startingValue = BN('10')    
    let value1 = writable(6)
    let value2 = writable(6)
    let value3 = writable(6)
    let value4 = writable(6)
    let value5 = writable(6)

    let rolling = false;

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    const startRolling = () => {
        rolling = true;
        keepRolling();
    };

    const keepRolling = () => {
        let dice = [value1, value2, value3, value4, value5];
        for(var i = 0; i < dice.length; i++) {
            let die = dice[i];
            setTimeout(()=>{
                if (rolling) {
                    die.set(getRandomInt(6)+1);
                }               
            }, 200+Math.random()*1000);
        }
        if (rolling) {
            setTimeout(keepRolling, 500);
        }
    }

    const stopRolling = () => {
        rolling = false;
    }

	onMount(() => {
        diceRollInputValue.set(startingValue)

    })
    const status = writable("ready");
    const errors = writable(null);
    const btnEnabled = derived(status, ($status)=>$status === 'ready' || $status === 'error');

    function rollDice() {
        status.set('betting')
        errors.set(null)
        if (BN($phiCurrencyBalance).comparedTo(BN($diceRollInputValue)) === -1) {
            errors.set(['You do not have enough PHI to make this bet.'])
            status.set('ready')
            return
        } 

        if (BN($diceRollInputValue).comparedTo(BN("1")) === -1 || BN("1000").comparedTo(BN($diceRollInputValue)) === -1) {
            errors.set(['You can only bet between 1 and 1000 PHI'])
            status.set('ready')
            return
        }

        startRolling();

        let afterApproval = () => {
            status.set('approved')
            sendDiceRoll($diceRollInputValue, diceRollTxStatus, (txResults)=>{
                if ($diceRollTxStatus.errors?.length > 0) {
                    status.set('error')
                    errors.set($diceRollTxStatus.errors)
                    stopRolling();
                } else {
                    console.log(txResults.txBlockResult.state[1].value.__fixed__)
                    console.log(txResults.txBlockResult.state[3].value.__fixed__)
                    let result = JSON.parse(txResults.resultInfo.returnResult);
                    console.log(result)
                    stopRolling();
                    setTimeout(() => {
                        value1.set(result[0])
                        value2.set(result[1])
                        value3.set(result[2])
                        value4.set(result[3])
                        value5.set(result[4])                            
                    }, 500);
                    phiCurrencyApprovedBalance.set(BN(txResults.txBlockResult.state[0].value.__fixed__))
                    phiCurrencyBalance.set(BN(txResults.txBlockResult.state[1].value.__fixed__))
                    lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[3].value.__fixed__))                     
                    status.set('ready')
                }
            })
        };
        
        if (BN($phiCurrencyApprovedBalance).comparedTo(BN($diceRollInputValue)) === -1) {
            console.log("Requires approval");
            sendHouseApproval($diceRollInputValue, diceRollApprovalTxStatus, (txResults)=>{
                if ($diceRollApprovalTxStatus.errors?.length > 0) {
                    status.set('error')
                    errors.set($diceRollApprovalTxStatus.errors)
                    stopRolling();
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
		width: max-content;
		margin: 1rem auto 1rem;
        text-align: center;
	}
    h2.buttons {
        margin-bottom: 2rem;
    }
    table {
        width: 200px;
    }
    table td {
        width: 50%;
        padding: 0px 5px;
    }
    table tr :nth-child(1) {
        text-align: left;
    }
    table tr :nth-child(2) {
        text-align: right;
    }
    table th {
        padding-bottom: 5px;
    }
    .dice-holder {
        margin-top: 2em;
    }
</style>

<h2 class="row align-center buttons">
    Roll the Dice
</h2>

<table>
    <thead>
        <tr>
            <th>Roll</th>
            <th>Payout</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>5 of a kind</td>
            <td>~ 185x</td>
        </tr>
        <tr>
            <td>4 of a kind</td>
            <td>~ 7.4x</td>
        </tr>
        <tr>
            <td>Full house</td>
            <td>~ 3.7x</td>
        </tr>
        <tr>
            <td>All unique</td>
            <td>~ 1.5x</td>
        </tr>
        <tr>
            <td>3 of a kind</td>
            <td>~ 0.9x</td>
        </tr>
        <tr>
            <td>2 pair</td>
            <td>~ 0.6x</td>
        </tr>
        <tr>
            <td>1 pair</td>
            <td>~ 0.3x</td>
        </tr>
    </tbody>
</table>

<div class="dice-holder buttons">
    <Dice value={value1} />
    <Dice value={value2} />
    <Dice value={value3} />
    <Dice value={value4} />
    <Dice value={value5} />
</div>


{#if connected}
<div class="row align-center buttons">
    <BNInputField
        onInputChange={(value)=>diceRollInputValue.set(value)}
        startingValue={startingValue}
        inputClass="primaryInput"
        labelClass="label"
        labelText="Your Wager"
    />
</div>



<div class="row align-center buttons">
    <button on:click={rollDice} disabled={!$btnEnabled}>
    {#if $btnEnabled}
        Roll
    {:else}
        Rolling...
    {/if}
    </button>
</div>

{#if $errors !== null}
    {#each $errors as error}
        <div class="row align-center buttons error">
            {error}
        </div>
    {/each}
{/if}

{/if}
