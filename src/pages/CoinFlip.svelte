<script>

// Components
import ConnectWallet from '../components/ConnectWallet.svelte'
import CoinFlip from '../components/Games/CoinFlip/CoinFlip.svelte';

</script>

<style>
    .buttons{
        width: max-content;
        margin: 2rem auto 1rem;
    }
</style>

<div class="buttons">
    <CoinFlip />
</div>

<div class="buttons flex">
    <ConnectWallet complete={false} current={false} />
</div>


    