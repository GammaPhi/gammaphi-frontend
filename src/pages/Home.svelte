<script>
	import { onMount } from 'svelte'
	import { navigate } from "svelte-routing";

	// Components
	import ConnectWallet from '../components/ConnectWallet.svelte'
	import CoinFlip from '../components/Games/CoinFlip.svelte';
    import { lamden_vk, lamdenTokenBalance  } from '../stores/lamdenStores'

</script>

<style>
	.description, h2{
		text-align: center;
	}
	.buttons{
		width: max-content;
		margin: 2rem auto 1rem;
	}
	.subtitle{
		text-align: center;
		font-size: 1em;
		width: max-content;
		margin: 2rem auto 1rem;
	}
	p{
		text-align: center;
		margin: 0.5rem 0.5em 0 0;
		color: var(--font-primary-dim);	
		width: max-content;
	}
</style>

<h2>Welcome to Lamden Phi</h2>
<div class="subtitle flex align-center">
	A blockchain dApp made by the community.
</div>

<div class="buttons">
	<CoinFlip />
</div>

<div class="buttons flex">
	<ConnectWallet complete={false} current={false} />
</div>


