<script>
    import { onMount, getContext } from 'svelte';

    // Components
    import LamdenBalance from './LamdenBalance.svelte'

    // Misc
    import BN from 'bignumber.js'
    import WalletController from 'lamden_wallet_controller';
    import { selectedNetwork, lamdenNetwork } from '../stores/globalStores.js';
    import { lotteryBalance, walletSelector, lamden_vk, lwc, phiCurrencyBalance, hasNetworkApproval, lamdenTokenBalance } from '../stores/lamdenStores.js';
    import { loginMobile, checkTokenBalance, getLotteryBalance, LAMDEN_MOBILE_WALLET_URL } from '../js/lamden-utils'
    import PhiTokenBalance from './PhiTokenBalance.svelte';
    import { writable } from 'svelte/store';

	onMount(() => {
        lwc.set(new WalletController(getApprovalRequest()))

        $lwc.events.on('newInfo', handleWalletInfo)

        setTimeout(() => {
            checkIfWalletIsInstalled()
        }, 100)

		return () => {
			$lwc.events.removeListener(handleWalletInfo)
		}
    })
    function checkIfWalletIsInstalled(){
        if ($walletSelector === 'extension') {
		    $lwc.walletIsInstalled()
        } else if ($walletSelector === 'browser') {
            loginMobile();
        }
    }

    let displayWalletConnectionOptions = writable(false);

    const onConnectClick = () => {
        if ($walletSelector) {
            checkIfWalletIsInstalled();
        } else {
            displayWalletConnectionOptions.set(true);
        }
    };

    function getApprovalRequest(){
        return $lamdenNetwork.app
    }

	const handleWalletInfo = async (info) => {
        hasNetworkApproval.set({approved: true})
        lamden_vk.set($lwc.walletAddress)
        phiCurrencyBalance.set(await checkTokenBalance('phi'))
        lotteryBalance.set(await getLotteryBalance())
    }

    function connectToBrowserWallet() {
        sessionStorage.setItem("lamdenWallet", "browser");
        walletSelector.set("browser");
        setTimeout(()=>{
            checkIfWalletIsInstalled();
        }, 50);
    }

    function connectToExtensionWallet() {
        sessionStorage.setItem("lamdenWallet", "extension");
        walletSelector.set("extension");
        setTimeout(()=>{
            checkIfWalletIsInstalled();
        }, 50);
    }

</script>


<style>
    a{
        color: var(--font-primary);
        text-decoration: underline;
        cursor: pointer;
    }
    a:hover{
        color: var(--accent-color);
    }
    a:visited{
        color: var(--font-primary);
    }

    button.extension {
        width: 200px;
    }

    button.browser {
        width: 200px;
    }

    .buttons {
        width: 100%;
    }
    .balances {
        max-width: 500px;
    }
</style>

<div align="center" class="row align-center buttons">
    {#if $lamden_vk}
        <div class="balances">
            <PhiTokenBalance />
            <LamdenBalance />
        </div>
    {:else}
        {#if $displayWalletConnectionOptions}
            <p>Select your wallet provider</p>
            <button class="extension" on:click={connectToExtensionWallet}>Chrome extension</button>
            <button class="browser" on:click={connectToBrowserWallet}>Browser wallet</button>    
        {:else}
            <button on:click={onConnectClick}>Connect To Lamden Wallet</button>
        {/if}
        <p>
            New to Lamden? Download the 
            <a target="_blank" href="https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim">Chrome extension</a>
            or create a 
            <a target="_blank" href={LAMDEN_MOBILE_WALLET_URL}>browser wallet</a>.
        </p>
    {/if}
</div>