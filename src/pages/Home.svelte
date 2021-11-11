<script>
import CoinFlip from './CoinFlip.svelte'
import Lottery from './Lottery.svelte'
import Purchase from './Purchase.svelte'
import WheelSpin from './WheelSpin.svelte'
import { navigateLink, page } from '../js/navigation-utils'
import BackHomeButton from '../components/BackHomeButton.svelte'
import About from './About.svelte';
import Roadmap from './Roadmap.svelte';

// Games
const gameInfo = [
    {
        name: 'PHI Flip',
        link: '/coinflip',
        description: "A truly fair, zero-commision odds game."
    },
    {
        name: 'PHI Spin',
        link: '/spin',
        description: "A truly fair, zero-commission spin the wheel game."
    },
	{
        name: 'PHI Lottery',
        link: '/lottery',
        description: "A truly fair, zero-commission lottery game."
    }
]

</script>

<style>
    .buttons{
        margin: 1rem auto 1rem;
    }
    .link{
        margin: 2rem auto 1rem;
    }
	.about-link {
		color: var(--accent-color);
		font-weight: bold;
        border-bottom: 2px solid var(--accent-color);
	}
</style>

{#if $page === '/'}
<div class="buttons" align="middle">
{#each gameInfo as game}

<div class="link">
    <a on:click={navigateLink} href={game.link}>{game.name}</a>
</div>
<div class="buttons">
    {game.description}
</div>

{/each}

<div class="link">
    <a class="about-link" on:click={navigateLink} href="/about">Learn more</a>
</div>
</div>

{:else}
	<div class="buttons" align="middle">
		<BackHomeButton />
	</div>

	{#if $page === '/coinflip'}

	<CoinFlip />

	{:else if $page === '/lottery'}

	<Lottery />

	{:else if $page === '/spin'}

	<WheelSpin/>

	{:else if $page === '/purchase'}

	<Purchase />

	{:else if $page === '/about'}

	<About />

	{:else if $page === '/roadmap'}

	<Roadmap />

	{/if}
{/if}