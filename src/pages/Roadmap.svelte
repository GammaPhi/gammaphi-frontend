<script>

// Roadmap
const roadmap = [
    {
        name: 'Wen',
        description: "Roadmap"
    },
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
		color: var(--accent-color)
	}
</style>

{#each roadmap as item}

<div align="center" class="link">
    {item.name}
</div>
<div align="center" class="buttons">
    {item.description}
</div>

{/each}