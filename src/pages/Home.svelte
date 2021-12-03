<script>
import CoinFlip from './CoinFlip.svelte'
import Lottery from './Lottery.svelte'
import Purchase from './Purchase.svelte'
import WheelSpin from './WheelSpin.svelte'
import { navigateLink, page } from '../js/navigation-utils'
import BackHomeButton from '../components/BackHomeButton.svelte'
import About from './About.svelte';
import DiceRoll from './DiceRoll.svelte'
import PreApprove from './PreApprove.svelte';

// Games
const gameInfo = [
	{
        name: 'Dice Roll',
        link: '/diceroll',
        description: "A truly fair, zero-commission dice rolling game. Roll a 5 of a kind to win ~185x your wager."
    },
	{
        name: 'Coin Flip',
        link: '/coinflip',
        description: "A truly fair, zero-commission set your own odds game. Win up to 1000x your wager."
    },
	{
        name: 'Prize Wheel',
        link: '/spin',
        description: "A truly fair, zero-commission spin the wheel game. Win up to 10x your wager."
    },
	{
        name: 'PHI Lottery',
        link: '/lottery',
        description: "A truly fair, zero-commission lottery game. 1 PHI equals 1 lottery ticket. The winner receives the entire pot."
    }
]

</script>

<style>
    .buttons{
        margin: 1rem auto 1rem;
    }
    .link{
        margin: 1rem auto 1rem;
    }
	.link a {
		font-size: 20px;
	}
	.link a:hover {
        border-bottom: 2px solid var(--accent-color);
	}
	.play{
        margin: 1rem auto 1rem;
	}
	.play a {
		font-weight: bold;
        border-bottom: 2px solid var(--accent-color);
	}
	.about-link {
		color: var(--accent-color);
		font-weight: bold;
        border-bottom: 2px solid var(--accent-color);
	}
	.about {
		margin-top: 2rem;
	}
</style>

{#if $page === '/'}
<div class="buttons" align="middle">

{#each gameInfo as game}

<div class="card">
	<div class="link">
		<a on:click={navigateLink} href={game.link}>{game.name}</a>
	</div>
	<div class="buttons">
		{game.description}
	</div>
	<div class="play">
		<a on:click={navigateLink} href={game.link}>Play Now</a>
	</div>
</div>

{/each}

<div class="link about">
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

	{:else if $page === '/diceroll'}

	<DiceRoll/>

	{:else if $page === '/purchase'}

	<Purchase />

	{:else if $page === '/about'}

	<About />

	{:else if $page === '/approve'}

	<PreApprove />

	{/if}
{/if}
