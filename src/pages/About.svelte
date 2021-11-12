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
    
    h2, h3 {
        margin-top: 2rem;
    }

    li {
        text-align: left;
    }
</style>

<div align="center" class="buttons">
    <h2>
        About Gamma Phi
    </h2>
    
    <p>
        Gamma Phi is a suite of fair gambling games built on the Lamden blockchain.
    </p>

    <h3>
        What does "fair" mean?
    </h3>

    <p>
        All of our games are commission-free, and we never take a percentage of your winnings.     
    </p>
    
    <p>
        So is this even gambling? Yes. It's the future of gambling.
    </p>

    <h2>
        $PHI Tokenomics
    </h2>

    <ul>
        <li class="yes">
            1 Billion Maximum Supply
        </li>

        <li class="yes">
            50% of supply is locked in the House
        </li>

        <li class="yes">
            20% locked in liquity pools (after initial sales)
        </li>

        <li class="yes">
            10% for presale
        </li>

        <li class="yes">
            10% for public sale
        </li>

        <li class="yes">
            5% reserved for the development team
        </li>

        <li class="yes">
            5% reserved for airdrops, marketing, and partnerships
        </li>
    </ul>
</div>

<div align="center" class="buttons">
    <a class="about-link" on:click={navigateLink} href="/roadmap">See Roadmap</a>
</div>