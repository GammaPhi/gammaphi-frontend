<script>
import { 
	username, 
} from '../stores/profileStore'

import CreateProfile from '../components/Profile/CreateProfile.svelte';
import MyProfile from '../components/Profile/MyProfile.svelte';
import { onMount } from 'svelte';
import { loadProfileStore } from '../js/profile-utils';

onMount(()=>{
	loadProfileStore();
})

</script>

<style>
	.buttons{
		margin: 2rem auto 1rem;
	}
</style>

<div align="middle" class="buttons">
	{#if $username.length === 0}
		<CreateProfile />
	{:else}
		<MyProfile />
	{/if}
</div>