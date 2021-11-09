<script>

// Components
import ConnectWallet from '../components/ConnectWallet.svelte'

// Components
const gameInfo = [
    {
        name: 'PHI Flip',
        link: '/coinflip',
        description: "A truly fair, zero-commision odds game."
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

{#each gameInfo as game}

<div class="link">
    <a href={game.link}>{game.name}</a>
</div>
<div class="buttons">
    {game.description}
</div>

{/each}

<div class="buttons flex">
	<ConnectWallet complete={false} current={false} />
</div>


