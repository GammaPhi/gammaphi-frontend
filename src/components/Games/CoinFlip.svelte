<script>
    import { onMount, getContext } from 'svelte';
    import { writable, derived, get } from "svelte/store";

    // Misc
    import BN from 'bignumber.js'
    import WalletController from 'lamden_wallet_controller';
    import { phiCurrencyBalance, coinFlipApprovalTxStatus, coinFlipTxStatus, lamdenWalletInfo, lamden_vk, lwc, hasNetworkApproval, lamdenTokenBalance } from '../../stores/lamdenStores.js';
    import InputNumber from '../InputNumber.svelte';
    import { sendCoinFlipApproval, sendCoinFlip } from '../../js/lamden-utils.js'
    import PhiTokenBalance from '../PhiTokenBalance.svelte'
    import { checkTokenBalance } from '../../js/lamden-utils'
    
    $: connected = $hasNetworkApproval.approved || false
    let balance = phiCurrencyBalance

	onMount(() => {
    })
    const status = writable(null);

    function placeBet() {
        status.set('betting')
        sendCoinFlipApproval('10', coinFlipApprovalTxStatus, ()=>{
            status.set('approved')
            sendCoinFlip('10', coinFlipTxStatus, async ()=>{
                status.set('done')
                balance.set(await checkTokenBalance('phi'))
            })
        })
    }
    
</script>


<style>
	.buttons{
		width: max-content;
		margin: 2rem auto 1rem;
        text-align: center;
	}
</style>

{#if connected}
<div class="row align-center buttons">
    <button on:click={placeBet}>Bet</button>
</div>
<div class="row align-center buttons">
    <PhiTokenBalance />
</div>
{/if}
