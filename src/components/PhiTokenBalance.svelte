<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from './TokenLogo.svelte'
    import ResultLink from './ResultLink.svelte'

    // Stores
    import { lamden_vk, phiCurrencyBalance } from '../stores/lamdenStores' 
    import { lamdenNetwork } from '../stores/globalStores' 

    // Misc
    import { checkTokenBalance } from '../js/lamden-utils'
    import { stringToFixed } from '../js/global-utils'
    import { navigateLink } from '../js/navigation-utils'

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
    }

</script>

<style>
    p{
        margin-right: 1em;
    }
</style>

<div class="flex row align-center">
    <TokenLogo token={{symbol: "PHI"}} clickable={false} size="tiny" />
    <p>{`${stringToFixed($phiCurrencyBalance, 8)}`} PHI</p>
</div>

{#if stringToFixed($phiCurrencyBalance, 8) === '0'}
<div class="buttons">
    No PHI? Purchase some <a on:click={navigateLink} href="/purchase">here</a>.
</div>    
{/if}
