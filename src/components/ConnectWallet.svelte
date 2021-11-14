<script>
    import { onMount, getContext } from 'svelte';

    // Components
    import LamdenBalance from './LamdenBalance.svelte'

    // Misc
    import BN from 'bignumber.js'
    import WalletController from 'lamden_wallet_controller';
    import { selectedNetwork, lamdenNetwork } from '../stores/globalStores.js';
    import { lotteryBalance, lamdenWalletInfo, lamden_vk, lwc, phiCurrencyBalance, hasNetworkApproval, lamdenTokenBalance } from '../stores/lamdenStores.js';
    import { checkTokenBalance, getLotteryBalance } from '../js/lamden-utils'
    import PhiTokenBalance from './PhiTokenBalance.svelte';

	onMount(() => {
        lwc.set(new WalletController(getApprovalRequest()))

        $lwc.events.on('newInfo', handleWalletInfo)

        setTimeout(() => {
            $lwc.walletIsInstalled()
        }, 100)

		return () => {
			$lwc.events.removeListener(handleWalletInfo)
		}
    })
    function checkIfWalletIsInstalled(){
		$lwc.walletIsInstalled()
    }

    function getApprovalRequest(){
        return $lamdenNetwork.app
    }

	const handleWalletInfo = async (info) => {
        hasNetworkApproval.set({approved: true})
        lamden_vk.set($lwc.walletAddress)
        phiCurrencyBalance.set(await checkTokenBalance('phi'))
        lotteryBalance.set(await getLotteryBalance())
    }
</script>


<style>
    a{
        color: var(--font-primary);
        text-decoration: underline;
        cursor: pointer;
    }
    a.install{
        display: block;
        margin-top: 1rem;
    }
    a:hover{
        color: var(--accent-color);
    }
    a:visited{
        color: var(--font-primary);
    }
    @media screen and (min-width: 430px) {
    }
</style>

<div align="center" class="row align-center buttons">
    {#if $lamden_vk}
        <PhiTokenBalance />
        <LamdenBalance />
    {:else}
        <button on:click={checkIfWalletIsInstalled}>Connect To Lamden Wallet</button>
        <p>
            New to Lamden? Create a Lamden wallet
            <a target="_blank" href="https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim">here</a>.
        </p>
    {/if}
</div>