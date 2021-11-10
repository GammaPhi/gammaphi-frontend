<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import { wheelSpinInputValue, phiCurrencyBalance, wheelSpinApprovalTxStatus, wheelSpinTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenCurrencyBalance } from '../../../stores/lamdenStores.js';
    import { sendWheelSpinApproval, sendWheelSpin } from '../../../js/lamden-utils.js'
    import PhiTokenBalance from '../../PhiTokenBalance.svelte'
    import BNInputField from '../../Inputs/BNInputField.svelte'
    import { stringToFixed } from '../../../js/global-utils'


    $: connected = true; //$hasNetworkApproval.approved || false
    let startingValue = BN('10')    
    let theWheel = null;
    const numSegments = 24;


	onMount(() => {
        wheelSpinInputValue.set(startingValue)

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

    })
    const status = writable("ready");
    const errors = writable(null);

    function calculatePrize(winningIdx)
    {
        let anglePerSegment = 360.0 / numSegments;

        // This formula always makes the wheel stop somewhere inside prize 3 at least
        // 1 degree away from the start and end edges of the segment.
        let stopAt = ((anglePerSegment * winningIdx + 1) + Math.floor((Math.random() * (anglePerSegment - 2))))

        // Important thing is to set the stopAngle of the animation before stating the spin.
        theWheel.animation.stopAngle = stopAt;

        // May as well start the spin from here.
        theWheel.startAnimation();
    }

    function spinWheel() {
        status.set('betting')
        errors.set(null)
        if (BN($phiCurrencyBalance) < BN($wheelSpinInputValue)) {
            errors.set(['You do not have enough PHI to make this bet.'])
            status.set('ready')
            return
        }       
        theWheel.stopAnimation();
        sendWheelSpinApproval($wheelSpinInputValue, wheelSpinApprovalTxStatus, (txResults)=>{
            if ($wheelSpinApprovalTxStatus.errors?.length > 0) {
                status.set('error')
                errors.set($wheelSpinApprovalTxStatus.errors)
            } else {
                status.set('approved')
                sendWheelSpin($wheelSpinInputValue, wheelSpinTxStatus, (txResults)=>{
                    if ($wheelSpinTxStatus.errors?.length > 0) {
                        status.set('error')
                        errors.set($wheelSpinTxStatus.errors)
                    } else {
                        console.log(txResults.txBlockResult.state[1].value.__fixed__)
                        console.log(txResults.txBlockResult.state[3].value.__fixed__)
                        let result = parseInt(txResults.resultInfo.message, 10);
                        console.log(result)
                        calculatePrize(result);
                        phiCurrencyBalance.set(BN(txResults.txBlockResult.state[1].value.__fixed__))
                        lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[3].value.__fixed__))                     
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
    <button on:click={spinWheel} >Spin</button>
</div>

{#if $errors !== null}
    {#each $errors as error}
        <div class="row align-center buttons error">
            {error}
        </div>
    {/each}
{/if}

{/if}
