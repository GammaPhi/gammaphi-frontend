<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { wheelSpinInputValue, phiCurrencyApprovedBalance, phiCurrencyBalance, wheelSpinApprovalTxStatus, wheelSpinTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../../../stores/lamdenStores.js';
    import { sendHouseApproval, sendWheelSpin } from '../../../js/lamden-utils.js'
    import PhiTokenBalance from '../../PhiTokenBalance.svelte'
    import BNInputField from '../../Inputs/BNInputField.svelte'
    import { stringToFixed } from '../../../js/global-utils'


    $: connected = true; //$hasNetworkApproval.approved || false
    let startingValue = BN('10')    
    let theWheel = null;
    const numSegments = 24;

    function drawTriangle()
    {
        // Get the canvas context the wheel uses.
        let ctx = theWheel.ctx;

        ctx.strokeStyle = 'navy';     // Set line colour.
        ctx.fillStyle   = 'aqua';     // Set fill colour.
        ctx.lineWidth   = 2;
        ctx.beginPath();              // Begin path.
        ctx.moveTo(100, 5);           // Move to initial position.
        ctx.lineTo(150, 5);           // Draw lines to make the shape.
        ctx.lineTo(125, 40);
        ctx.lineTo(100, 5);
        ctx.stroke();                 // Complete the path by stroking (draw lines).
        ctx.fill();                   // Then fill.
    }
    

    const createWheel = () => {
        // Create new wheel object specifying the parameters at creation time.
        theWheel = new Winwheel({
            'numSegments'  : numSegments,     // Specify number of segments.
            'outerRadius'  : 125,   // Set outer radius so wheel fits inside the background.
            'textFontSize' : 18,    // Set font size as desired.
            'segments'     :        // Define segments including colour and text.
            [
                {'fillStyle' : '#eae56f', 'text' : '            10x'},
                {'fillStyle' : '#89f26e', 'text' : '            1x'},
                {'fillStyle' : '#7de6ef', 'text' : '            0x'},
                {'fillStyle' : '#e7706f', 'text' : '            2x'},
                {'fillStyle' : '#eae56f', 'text' : '            0x'},
                {'fillStyle' : '#89f26e', 'text' : '            3x'},
                {'fillStyle' : '#7de6ef', 'text' : '            0x'},
                {'fillStyle' : '#e7706f', 'text' : '            0x'},
                {'fillStyle' : '#eae56f', 'text' : '            0x'},
                {'fillStyle' : '#89f26e', 'text' : '            1x'},
                {'fillStyle' : '#7de6ef', 'text' : '            0x'},
                {'fillStyle' : '#e7706f', 'text' : '            0x'},
                {'fillStyle' : '#eae56f', 'text' : '            0x'},
                {'fillStyle' : '#89f26e', 'text' : '            2x'},
                {'fillStyle' : '#7de6ef', 'text' : '            0x'},
                {'fillStyle' : '#e7706f', 'text' : '            0x'},
                {'fillStyle' : '#eae56f', 'text' : '            0x'},
                {'fillStyle' : '#89f26e', 'text' : '            1x'},
                {'fillStyle' : '#7de6ef', 'text' : '            0x'},
                {'fillStyle' : '#e7706f', 'text' : '            1x'},
                {'fillStyle' : '#eae56f', 'text' : '            0x'},
                {'fillStyle' : '#89f26e', 'text' : '            3x'},
                {'fillStyle' : '#7de6ef', 'text' : '            0x'},
                {'fillStyle' : '#e7706f', 'text' : '            0x'},
            ],
            'animation' :           // Specify the animation to use.
            {
                'type'          : 'spinToStop',
                'duration'      : 5,
                'spins'         : 8,
                'callbackAfter' : drawTriangle
            }
        });

        // Usual pointer drawing code.
        drawTriangle();
    }

	onMount(() => {
        wheelSpinInputValue.set(startingValue)

        createWheel();

    })
    const status = writable("ready");
    const errors = writable(null);
    const btnEnabled = derived(status, ($status)=>$status === 'ready' || $status === 'error');

    function calculatePrize(winningIdx)
    {
        createWheel();

        let anglePerSegment = 360.0 / numSegments;

        // This formula always makes the wheel stop somewhere inside prize 3 at least
        // 1 degree away from the start and end edges of the segment.
        let stopAt = ((anglePerSegment * winningIdx + 1) + Math.floor((Math.random() * (anglePerSegment - 2))))

        // Important thing is to set the stopAngle of the animation before stating the spin.
        theWheel.animation.stopAngle = stopAt;
        theWheel.animation.spins = 8;
        theWheel.animation.duration = 5;

        theWheel.startAnimation();
    }

    function spinWheel() {
        status.set('betting')
        errors.set(null)
        if (BN($phiCurrencyBalance).comparedTo(BN($wheelSpinInputValue)) === -1) {
            errors.set(['You do not have enough PHI to make this bet.'])
            status.set('ready')
            return
        }       

        if (BN($wheelSpinInputValue).comparedTo(BN("1")) === -1 || BN("1000").comparedTo(BN($wheelSpinInputValue)) === -1) {
            errors.set(['You can only bet between 1 and 1000 PHI'])
            status.set('ready')
            return
        }

        theWheel.stopAnimation();

        let afterApproval = () => {
            status.set('approved')
            sendWheelSpin($wheelSpinInputValue, wheelSpinTxStatus, (txResults)=>{
                if ($wheelSpinTxStatus.errors?.length > 0) {
                    status.set('error')
                    errors.set($wheelSpinTxStatus.errors)
                } else {
                    let result = parseInt(txResults.resultInfo.returnResult, 10);
                    console.log(result)
                    calculatePrize(result);
                    phiCurrencyApprovedBalance.set(BN(txResults.txBlockResult.state[0].value.__fixed__))
                    phiCurrencyBalance.set(BN(txResults.txBlockResult.state[1].value.__fixed__))
                    lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[3].value.__fixed__))                     
                    status.set('ready')
                }
            })
        };

        if (BN($phiCurrencyApprovedBalance).comparedTo(BN($wheelSpinInputValue)) === -1) {
            console.log("Requires approval");
            sendHouseApproval($wheelSpinInputValue, wheelSpinApprovalTxStatus, (txResults)=>{
                if ($wheelSpinApprovalTxStatus.errors?.length > 0) {
                    status.set('error')
                    errors.set($wheelSpinApprovalTxStatus.errors)
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
</style>

<h2 class="row align-center buttons">
    Feeling Lucky?
</h2>

<canvas id="canvas" width="250" height="300">
    <p align="center">Sorry, your browser doesn't support canvas. Please try another.</p>
</canvas>

{#if connected}
<div class="row align-center buttons">
    <BNInputField
        onInputChange={(value)=>wheelSpinInputValue.set(value)}
        startingValue={startingValue}
        inputClass="primaryInput"
        labelClass="label"
        labelText="Your Wager"
    />
</div>


<div class="row align-center buttons">
    <button on:click={spinWheel} disabled={!$btnEnabled}>
    {#if $btnEnabled}
        Spin
    {:else}
        Spinning...
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
