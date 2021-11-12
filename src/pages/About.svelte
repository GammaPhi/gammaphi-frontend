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

    <p>
        Gamma Phi is a play on the word "GameFi".
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

    <h3>
        100% Open Source
    </h3>

    <a href="https://github.com/GammaPhi/gammaphi-contracts.git" target="_blank">
        Smart Contracts
    </a><br/><br/>
    <a href="https://github.com/GammaPhi/gammaphi-frontend.git" target="_blank">
        Frontend
    </a>

    <h3>$PHI</h3>

    <p>
        PHI is the native token of Gamma Phi. PHI powers all of the fair lottery games. 
        You can purchase PHI
        <a on:click={navigateLink} href="/purchase">here</a>.
    </p>

    <h3>
        Tokenomics
    </h3>

    <ul>
        <li class="yes">
            1 Billion Maximum Supply
            (<a target="_blank" href="https://www.tauhq.com/transactions/c9bd501d46db6eacdaa1ba0f18bd6a89b2cc20129e348a9ecc904c8745ae2cce">View Txn</a>)
        </li>

        <li class="yes">
            50% of supply is locked in the House
            (<a target="_blank" href="https://www.tauhq.com/transactions/e05fb11390626d35b326d3f6a46b95851043d1f251ec9d6e98a36778607d9147">View Txn</a>)
        </li>

        <li class="yes">
            20% for public sale
            (<a target="_blank" href="https://www.tauhq.com/transactions/5e7d5b9ee0db36092fccaebcf9005f4b88a3557cb682d905099acd3505313966">View Txn</a>)
        </li>

        <li class="no-bullet">
            10% locked in liquity pools (after initial sales)
        </li>

        <li class="no-bullet">
            10% reserved for the development team
        </li>

        <li class="no-bullet">
            10% reserved for airdrops, marketing, and partnerships
        </li>
    </ul>
</div>

<div align="center" class="buttons">
    <a class="about-link" on:click={navigateLink} href="/roadmap">See Roadmap</a>
</div>