<script>
	import { onMount } from 'svelte'
	import { navigate } from "svelte-routing";

	// Components
	import ConnectWallet from '../components/ConnectWallet.svelte'
	import CoinFlip from '../components/Games/CoinFlip.svelte';
    import { lamden_vk, lamdenTokenBalance  } from '../stores/lamdenStores'

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


