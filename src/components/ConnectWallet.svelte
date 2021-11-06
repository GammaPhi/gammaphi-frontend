<script>
    import { onMount, getContext } from 'svelte';

    // Components
    import LamdenBalance from './LamdenBalance.svelte'

    // Misc
    import BN from 'bignumber.js'
    import WalletController from 'lamden_wallet_controller';
    import { selectedNetwork, lamdenNetwork } from '../stores/globalStores.js';
    import { lamdenWalletInfo, lamden_vk, lwc, phiCurrencyBalance, hasNetworkApproval, lamdenTokenBalance } from '../stores/lamdenStores.js';
    import { checkTokenBalance } from '../js/lamden-utils'

    $: notAttempted = $lamdenWalletInfo.installed === undefined
    $: installed = $lamdenWalletInfo.installed || false
    $: connected = $hasNetworkApproval.approved || false
    $: locked = connected ? $lamdenWalletInfo.locked === true : true

	onMount(() => {
        lwc.set(new WalletController(getApprovalRequest()))

        $lwc.events.on('newInfo', handleWalletInfo)

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
        if (info.approvals){
            if (Object.keys(info.approvals).includes($selectedNetwork)){
                hasNetworkApproval.set({approved: true})
                lamden_vk.set($lwc.walletAddress)
                phiCurrencyBalance.set(await checkTokenBalance('phi'))
            }
        }
        if (!info.errors){
            lamdenWalletInfo.set(info)
        }
		
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

<div class="row align-center buttons">
    {#if $lamden_vk}
        <LamdenBalance />
    {/if}

    {#if notAttempted}
        <button on:click={checkIfWalletIsInstalled}>Connect To Lamden Wallet</button>
    {:else}
        {#if !installed}
            <a class="install" href="{$lamdenNetwork.wallet_install_url}" target="_blank" rel="noopener noreferrer">Click to Install Lamden Wallet</a> 
        {/if}
    {/if}
</div>