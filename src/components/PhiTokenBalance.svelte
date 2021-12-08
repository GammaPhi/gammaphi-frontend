<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from './TokenLogo.svelte'
    import ResultLink from './ResultLink.svelte'
    import BN from 'bignumber.js'

    // Stores
    import { lamden_vk, phiCurrencyBalance, legacyPhiCurrencyBalance, phiCurrencyApprovedBalance } from '../stores/lamdenStores' 
    import { lamdenNetwork } from '../stores/globalStores' 

    // Misc
    import { checkTokenBalance, checkTokenApprovedBalance } from '../js/lamden-utils'
    import { stringToFixed } from '../js/global-utils'
    import { navigateLink, page } from '../js/navigation-utils'

    let timer = null

    onMount(() => {
        
        timer = setTimeout(refreshPhiBalance, 1000)
        refreshPhiBalance()

        return () => {
            timer = null
        }
    })

    async function refreshPhiBalance(){
        if (timer === null) return
        if (!$lamden_vk) return
        phiCurrencyBalance.set(await checkTokenBalance('phi'))
        legacyPhiCurrencyBalance.set(await checkTokenBalance('phi_old'))
        phiCurrencyApprovedBalance.set(await checkTokenApprovedBalance('phi', 'coinFlip'));
    }

</script>

<style>
    p{
        margin-right: 1em;
    }
    a {
        margin-left: 5px;
    }
    span.approved {
        color: var(--accent-color);
        font-weight: bold;
    }
</style>

<div class="flex row align-center">
    <TokenLogo token={{symbol: "PHI"}} clickable={false} size="tiny" />
    <p>{`${stringToFixed($phiCurrencyBalance, 8)}`} PHI 
        <span class="approved">
            ({`${stringToFixed($phiCurrencyApprovedBalance, 4)}`} Approved)
        </span>
    </p>
</div>
{#if BN($legacyPhiCurrencyBalance).comparedTo(BN('0'))===1 && $page !== '/redeem'}
<div class="flex row align-center">
    Upgrade your legacy PHI{" "}<a on:click={navigateLink} href="/redeem">here</a>.
</div>    
{:else if stringToFixed($phiCurrencyBalance, 8) === '0' && $page !== '/purchase' && $page !== '/redeem'}
<div class="flex row align-center">
    No PHI? Purchase some{" "}<a on:click={navigateLink} href="/purchase">here</a>.
</div>    
{/if}
