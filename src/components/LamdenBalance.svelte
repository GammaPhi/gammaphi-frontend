<script>
    import { onMount } from 'svelte'

    // Components
    import TokenLogo from './TokenLogo.svelte'
    import ResultLink from './ResultLink.svelte'

    // Stores
    import { lamden_vk, lamdenCurrencyBalance } from '../stores/lamdenStores' 
    import { lamdenNetwork } from '../stores/globalStores' 

    // Misc
    import { checkLamdenBalance } from '../js/lamden-utils'
    import { stringToFixed } from '../js/global-utils'

    let timer = null
    let networkInfo = lamdenNetwork

    let lamdenToken = {symbol: $networkInfo.network_symbol}

    $: blockexplorer = `${$networkInfo.blockexplorer}`
    $: addressURL = `${blockexplorer}/${$networkInfo.blockexplorer_address}/${$lamden_vk}`

    onMount(() => {
        
        timer = setTimeout(refreshLamdenBalance, 1000)
        refreshLamdenBalance()

        return () => {
            timer = null
        }
    })

    async function refreshLamdenBalance(){
        if (timer === null) return
        if (!$lamden_vk) return
        lamdenCurrencyBalance.set(await checkLamdenBalance())
    }

</script>

<style>
    p{
        margin-right: 1em;
    }
</style>

<div class="flex row align-center">
    <TokenLogo token={lamdenToken} clickable={false} size="tiny" />
    <p>{`${stringToFixed($lamdenCurrencyBalance, 8)} ${$networkInfo.network_symbol}`}</p>
</div>