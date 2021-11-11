<script>
import { navigateLink, page } from '../js/navigation-utils'

</script>

<style>
    .buttons{
        margin: 2rem auto 1rem;
        max-width: 550px;
    }
    .about-link {
        font-weight: bold;
        border-bottom: 2px solid var(--accent-color);
    }
</style>

<div align="center" class="buttons">
    <h2>
        About Gamma Phi
    </h2>
    
    <p>
        Gamma Phi is a suite of fair gambling games built on the Lamden blockchain.
    </p>

    <h4>
        What does "fair" mean?
    </h4>

    <p>
        Fair means that the expected return for any of our games is exactly 0%.
        All of our games are commission-free, and we never take a percentage of your winnings. 
        So is this even gambling? Yes. It's the future of gambling.
    </p>


</div>

<div align="center" class="buttons">
    <a class="about-link" on:click={navigateLink} href="/roadmap">See Roadmap</a>
</div>