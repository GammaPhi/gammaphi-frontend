<script>
import CoinFlip from './CoinFlip.svelte'
import Lottery from './Lottery.svelte'
import Purchase from './Purchase.svelte'
import WheelSpin from './WheelSpin.svelte'
import { navigateLink, page } from '../js/navigation-utils'
import BackHomeButton from '../components/BackHomeButton.svelte'

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
        width: max-content;
        margin: 1rem auto 1rem;
    }
    .link{
        width: max-content;
        margin: 2rem auto 1rem;
    }
</style>

{#if $page === '/'}
{#each gameInfo as game}

<div class="link">
    <a on:click={navigateLink} href={game.link}>{game.name}</a>
</div>
<div class="buttons">
    {game.description}
</div>

{/each}

{:else}
	<div class="buttons">
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

	{/if}
{/if}