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
import Redeem from './Redeem.svelte';
import Profile from './Profile.svelte';
import Poker from './Poker.svelte';
import UserPage from './UserPage.svelte';
import { writable } from 'svelte/store';
import { onMount } from 'svelte';
import Board from './Board.svelte';
import Lamnado from './Lamnado.svelte';
import SportsBetting from './SportsBetting.svelte';
export let address = null;

const frenAddress = writable(address);

function updateAddress() {
	if ($page.startsWith('/fren/')) {
		frenAddress.set($page.replace("/fren/", "").trim());
		console.log(address);
	} else {
		frenAddress.set(null);
	}
}

$: $page, updateAddress();

// Games
const gameInfo = [
	{
        name: 'Sports Betting (In Progress)',
        link: '/sports',
        description: "Use your PHI tokens to bet on your favorite sports games."
    },
	{
        name: 'Poker (Alpha)',
        link: '/poker',
        description: "Play decentralized poker with your friends or join a public table."
    },
	{
        name: 'Board Games (Alpha)',
        link: '/board',
        description: "Play decentralized go, chess, or checkers with a friend or join a public game."
    },
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

	{:else if $page === '/poker'}

	<Poker />

	{:else if $page === '/board'}

	<Board />

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

	{:else if $page === '/lamnado'}

	<Lamnado />

	{:else if $page === '/sports'}

	<SportsBetting />

	{:else if $page === '/profile'}

	<Profile />

	{:else if $page.startsWith('/fren/')}

	<UserPage user_address={$frenAddress} />

	{:else if $page === '/redeem'}

	<Redeem />

	{/if}

	{#if $page === '/coinflip' || $page === '/spin' || $page === '/diceroll'}
    <div class="buttons" align="middle">
        <a class="about-link" on:click={navigateLink} href="/approve">Pre-approve $PHI</a>
        <br />
    </div>
    {/if}
{/if}
