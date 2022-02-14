<script lang="ts">
import { Router, Route } from "svelte-routing";

// Pages
import Home from "./pages/Home.svelte";

// Components
import Banner from "./components/Banner.svelte";
import NavBar from "./components/Nav/NavigationBar.svelte";
import Footer from "./components/Footer.svelte";

// Misc
import { onMount } from 'svelte'
import ConnectWallet from "./components/ConnectWallet.svelte";

// Stores
import { lamden_vk } from './stores/lamdenStores.js';
import { username } from "./stores/profileStore";
import Link from "./components/Link.svelte";
import { navigateLink } from "./js/navigation-utils";


onMount(() => {
	unregisterOldServiceWorkers()
})

function unregisterOldServiceWorkers(){
	if (typeof navigator === "undefined") return
	if (typeof navigator.serviceWorker === "undefined") return

	navigator.serviceWorker.getRegistrations()
	.then(registrations => {
		for(let registration of registrations) { 
			registration.unregister(); 
		}
		if (registrations.length > 0) window.location.reload()
	})
}
</script>

<style>
	main{
		position: relative;
		padding: 1rem;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}

	@media only screen and (min-width: 650px) {
		main{
			max-width: 1000px;
		}
	}
	@media only screen and (min-width: 1280px) {
		main{
			max-width: 1280px;
		}
	}
	@media only screen and (min-width: 2800px) {
		main{
			max-width: 2800px;
		}
	}
	
	.buttons{
		margin: 2rem auto 1rem;
		width: 100%;
	}
	.top {
		width: 100%;
		margin: 1rem auto 1rem;
	}
	.top p {
		margin: auto;
	}
	.top a {
		margin: auto;
	}
</style>

<Router>
	<NavBar />
	<Banner />
	<main>
		{#if !$lamden_vk}
		<div class="top flex">
			<ConnectWallet showHelp={false} />
		</div>
		{:else if $username.length > 0}
			<div class="top flex">
				<p>
					Logged in as{" "}
					<a href="/profile" on:click={navigateLink}>{$username}</a>
				</p>	
			</div>
		{:else}
			<div class="top flex">
				<a href="/profile" on:click={navigateLink}>Create a Profile</a>
			</div>
		{/if}
		<Route path="/" component={Home} />
		<Route path="/purchase" component={Home} />
		<Route path="/poker" component={Home} />
		<Route path="/board" component={Home} />
		<Route path="/coinflip" component={Home} />
		<Route path="/diceroll" component={Home} />
		<Route path="/spin" component={Home} />
		<Route path="/lamnado" component={Home} />
		<Route path="/sports" component={Home} />
		<Route path="/about" component={Home} />
		<Route path="/approve" component={Home} />
		<Route path="/fren/:address" let:params>
			<Home address={params.address} />
		</Route>
		<Route path="/redeem" component={Home} />
		<Route path="/profile" component={Home} />
		<div class="buttons flex">
			<ConnectWallet />
		</div>
	</main>
	<Footer />
</Router>


