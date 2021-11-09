<script>

// Components
import ConnectWallet from '../components/ConnectWallet.svelte'
import Lottery from '../components/Games/Lottery/Lottery.svelte';

</script>

<style>
    .buttons{
        width: max-content;
        margin: 2rem auto 1rem;
    }
</style>

<div class="buttons">
    <Lottery />
</div>

<div class="buttons flex">
    <ConnectWallet complete={false} current={false} />
</div>


    