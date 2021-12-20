<script>
import { onMount } from 'svelte';
import { writable } from 'svelte/store';


import FrenProfile from '../components/Profile/FrenProfile.svelte';

export let user_address;

</script>

<style>
	.buttons{
		margin: 2rem auto 1rem;
	}
</style>

<div align="middle" class="buttons card">
	{#if user_address !== null}
		<FrenProfile user_address={user_address} />
	{/if}
</div>