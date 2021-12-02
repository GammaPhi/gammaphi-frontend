<script>
import TokenomicsChart from '../components/Roadmap/TokenomicsChart.svelte';
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

    h2.tokenomics {
        margin-top: 3rem;
    }

    h2.roadmap {
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

    table.contracts td {
        width: 100%;
        padding: 10px;
        padding-bottom: 15px;
        line-height: 25px;
        text-align: center;
        height: 70px;
    }

    table.tokenomics {
        margin-top: 2rem;
    }

    table.tokenomics td {
        width: 100%;
        padding: 10px;
        padding-bottom: 15px;
        line-height: 25px;
        text-align: center;
        height: 20px;
    }

    table td a {
        border-bottom: 2px solid var(--accent-color);
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
    </a><br/><br/>
    <a href="https://github.com/GammaPhi/lamden-mobile-wallet.git" target="_blank">
        Mobile Wallet
    </a>

    <h3>$PHI</h3>

    <p>
        PHI is the Lamden token that powers Gamma Phi. PHI is used as the currency for all of the games on Gamma Phi.
    </p>

    <p>
        You can purchase PHI
        <a on:click={navigateLink} href="/purchase">here</a>.
    </p>

    <h2 class="tokenomics">
        Tokenomics
    </h2>

    <TokenomicsChart />

    <table class="tokenomics">
        <tbody>
            <tr>
                <td>
                    1 Billion Maximum Supply
                    (<a target="_blank" href="https://www.tauhq.com/transactions/c9bd501d46db6eacdaa1ba0f18bd6a89b2cc20129e348a9ecc904c8745ae2cce">View Txn</a>)
                </td>
            </tr>
            <tr>
                <td>
                    50% of supply is locked in the House
                    (<a target="_blank" href="https://www.tauhq.com/transactions/e05fb11390626d35b326d3f6a46b95851043d1f251ec9d6e98a36778607d9147">View Txn</a>)
                </td>
            </tr>
            <tr>
                <td>
                    20% for public sale
                    (<a target="_blank" href="https://www.tauhq.com/transactions/5e7d5b9ee0db36092fccaebcf9005f4b88a3557cb682d905099acd3505313966">View Txn</a>)
                </td>
            </tr>
            <tr>
                <td>
                    10% locked in liquity pools (after initial sales via
                    <a target="_blank" href="https://nebulamden.finance/">Nebula's Time-Locked Vaults</a>)
                </td>
            </tr>
            <tr>
                <td>
                    10% reserved for the development team
                </td>
            </tr>
            <tr>
                <td>
                    5% reserved for community contests and airdrops
                </td>
            </tr>
            <tr>
                <td>
                    5% reserved for marketing and partnerships
                </td>
            </tr>
        </tbody>
    </table>

    <h2 class="roadmap">
        Roadmap (work in progress)
    </h2>

    <ul>
        <li class="yes">
            Alpha platform release with handful of fair games    
        </li>

        <li class="yes">
            Stealth launch
        </li>

        <li class="yes">
            Build mobile-compatible browser wallet
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
            Multiplayer games
        </li>

        <li class="no-bullet">
            Beta platform release with improved UI
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

    <table class="contracts">
        <tbody>
            <tr>
                <td>
                    <a href="https://github.com/GammaPhi/gammaphi-contracts/blob/master/con_phi.py" target="_blank">con_phi</a>
                    <br /> <br />
                    The contract for the PHI currency.
                </td>
            </tr>
            <tr>
                <td>
                    <a href="https://github.com/GammaPhi/gammaphi-contracts/blob/master/con_gamma_phi_sales_v3.py" target="_blank">con_gamma_phi_sales_v3</a>
                    <br /> <br />
                    The contract where you can purchase PHI during initial sales.
                </td>
            </tr>
            <tr>
                <td>
                    <a href="https://github.com/GammaPhi/gammaphi-contracts/blob/master/con_gamma_phi_house_v1.py" target="_blank">con_gamma_phi_house_v1</a>
                    <br /> <br />
                    The contract where the House PHI is stored, and where the majority of game logic lives.
                </td>
            </tr>
            <tr>
                <td>
                    <a href="https://github.com/GammaPhi/gammaphi-contracts/blob/master/con_gamma_phi_lottery_v1.py" target="_blank">con_gamma_phi_lottery_v1</a>
                    <br /> <br />
                    The contract where lottery tickets are held before distribution.
                </td>                
            </tr>
        </tbody>
    </table>

    <h3>Be safe out there and have fun.</h3>
</div>
</div>
