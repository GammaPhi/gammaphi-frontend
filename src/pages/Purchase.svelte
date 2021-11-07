<script>

	// Components
	import ConnectWallet from '../components/ConnectWallet.svelte'
	import PurchasePhi from '../components/PurchasePhi.svelte';
	
</script>

<style>
	.buttons{
		width: max-content;
		margin: 2rem auto 1rem;
	}
</style>

<div class="buttons">
	<PurchasePhi />
</div>

<div class="buttons flex">
	<ConnectWallet complete={false} current={false} />
</div>


	