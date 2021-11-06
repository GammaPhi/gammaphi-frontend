<script>
	import { onMount } from 'svelte'
	import { writable, derived } from "svelte/store";
	import { navigate } from "svelte-routing";

	// Components
	import ConnectWallet from '../components/ConnectWallet.svelte'
	import CoinFlip from '../components/Games/CoinFlip.svelte';
	import PurchasePhi from '../components/PurchasePhi.svelte';
    import { lamden_vk, lamdenTokenBalance  } from '../stores/lamdenStores'

	const page = writable("home")

</script>

<style>
	.buttons{
		width: max-content;
		margin: 2rem auto 1rem;
	}
</style>

{#if $page === 'home'}
<div class="buttons flex">
	<button on:click={()=>{page.set("game")}}>Purchase Phi</button>
</div>
<div class="buttons">
	<CoinFlip />
</div>
{:else}
<div class="buttons flex">
	<button on:click={()=>{page.set("home")}}>Play Game</button>
</div>
<div class="buttons">
	<PurchasePhi />
</div>
{/if}

<div class="buttons flex">
	<ConnectWallet complete={false} current={false} />
</div>


