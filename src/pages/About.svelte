<script>
import { navigateLink, page } from '../js/navigation-utils'

</script>

<style>
    .buttons{
        max-width: 550px;
    }
    .about-link {
        font-weight: bold;
        border-bottom: 2px solid var(--accent-color);
    }
    
    h3 {
        margin-top: 3rem;
    }

    p {
        line-height: 25px;
    }

    li {
        line-height: 25px;
        margin-top: 1rem;
        text-align: left;
    }
    table, th, td {
        border: 1px solid black;
    }

    table {
        width: 100%;
    }
    table td {
        width: 50%;
        height: 70px;
        padding: 10px;
        line-height: 25px;
    }
    table tr :nth-child(1) {
        text-align: center;
    }
    table tr :nth-child(2) {
        text-align: center;
    }
    table th {
        padding-bottom: 5px;
        height: 50px;
    }
    table tr {
        padding-top: 10px;
        padding-bottom: 10px;
    }

</style>

<div align="center" class="card">
<div align="center" class="buttons">
    <h2>
        About Gamma Phi
    </h2>
    
    <p>
        Gamma Phi is a suite of fair gambling games built on the Lamden blockchain.
    </p>

    <p>
        Gamma Phi is a play on the term "GameFi".
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
        PHI is the Lamden token that powers Gamma Phi. PHI is used as the currency for all of the games on Gamma Phi.
    </p>

    <p>
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
            10% locked in liquity pools (after initial sales via
            <a target="_blank" href="https://nebulamden.finance/">Nebula's Time-Locked Vaults</a>)
        </li>

        <li class="no-bullet">
            10% reserved for the development team
        </li>

        <li class="no-bullet">
            10% reserved for contests, airdrops, marketing, and partnerships
        </li>
    </ul>

    <h3>
        Roadmap
    </h3>

    <ul>
        <li class="yes">
            Alpha platform release with handful of fair games    
        </li>

        <li class="yes">
            Stealth launch
        </li>

        <li class="no-bullet">
            Marketing and community engagement and partnerships
        </li>

        <li class="no-bullet">
            Airdrops to early PHI holders
        </li>

        <li class="no-bullet">
            Community voting on additional games to expand the Gamma Phi ecosystem
        </li>

        <li class="no-bullet">
            Beta platform release with improved UI and additional games
        </li>
    </ul>

    <h3>
        Safety Tips (IMPORTANT!!!)
    </h3>

    <ol>
        <li>
            There are lots of scams out there. When in doubt, always use a burner wallet, and don't keep more tokens in your burner wallet than you are willing to lose.
        </li>

        <li>
            When playing Gamma Phi games, always make sure the base URL is <a href="https://gammaphi.io/">https://gammaphi.io/</a>. Any other URL is almost guaranteed to be a scam.
        </li>

        <li>
            Be careful with social media. 
            The only official Twitter account is <a href="https://twitter.com/GammaPhi_Lamden" target="_blank">@GammaPhi_Lamden</a>. 
            The only official Telegram channel is <a href="https://t.me/gammaphi_lamden" target="_blank">gammaphi_lamden</a>.
            Do not interact with any other social media claiming to represent Gamma Phi.
        </li>

        <li>
            Never interact with unknown smart contracts. Smart contract names are unique, so make sure you know which ones you are interacting with.
            The only smart contracts you will find on Gamma Phi are in the table below.
        </li>
    </ol>

    <h3>
        Contracts
    </h3>

    <table class="contracts">
        <thead>
            <tr>
                <th>
                    Contract
                </th>
                <th>
                    Description
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <a href="https://github.com/GammaPhi/gammaphi-contracts/blob/master/con_phi.py" target="_blank">con_phi</a>
                </td>
                <td>
                    The contract for the PHI currency.
                </td>
            </tr>
            <tr>
                <td>
                    <a href="https://github.com/GammaPhi/gammaphi-contracts/blob/master/con_gamma_phi_sales_v1.py" target="_blank">con_gamma_phi_sales_v1</a>
                </td>
                <td>                    
                    The contract where you can purchase PHI during initial sales.
                </td>
            </tr>
            <tr>
                <td>
                    <a href="https://github.com/GammaPhi/gammaphi-contracts/blob/master/con_gamma_phi_house_v1.py" target="_blank">con_gamma_phi_house_v1</a>
                </td>
                <td>                    
                    The contract where the House PHI is stored, and where the majority of game logic lives.
                </td>
            </tr>
            <tr>
                <td>
                    <a href="https://github.com/GammaPhi/gammaphi-contracts/blob/master/con_gamma_phi_lottery_v1.py" target="_blank">con_gamma_phi_lottery_v1</a>
                </td>
                <td>
                    The contract where lottery tickets are held before distribution.
                </td>                
            </tr>
        </tbody>
    </table>

    <h3>Be safe out there and have fun.</h3>
</div>
</div>
