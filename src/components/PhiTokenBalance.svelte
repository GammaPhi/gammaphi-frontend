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
		text-align: center;
		margin: 0.5rem 0.5em 0 0;
		color: var(--font-primary-dim);	
		width: max-content;
	}
</style>

<div class="flex row align-center">
    <p>Balance: {`${stringToFixed($phiCurrencyBalance, 8)}`} PHI</p>
</div>