
/*
    BDT Mainnet info
    {
        name: 'BDT',
        address: '0x7BCe667EF12023dc5f8577D015a2F09d99a5ef58',
        decimals: 18
    }
*/

export const mainnet = {
    lamden: {
        apiLink: "https://mainnet.lamden.io/api",
        blockexplorer: "https://www.tauhq.com",
        blockexplorer_tx: "transactions",
        blockexplorer_address: "addresses",
        wallet_install_url: "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim",
        networkName: "Lamden Mainnet",
        network_symbol: "TAU",
        currentStampRatio: 65,
        stamps: {
            burn: 65,
            approval: 65
        }
    }
}

export const testnet = {
    lamden: {
        apiLink: "https://testnet.lamden.io/api",
        blockexplorer: "https://testnet.lamden.io",
        blockexplorer_tx: "transactions",
        blockexplorer_address: "addresses",
        wallet_install_url: "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim",
        games: {
            coinFlip: {
                networkType: "testnet",
                contractName: "con_test_eh_game_v3",
            }
        },
        coins: {
            phi: {
                networkType: "testnet",
                contractName: "con_eh_game_token_1",
            }
        },
        networkName: "Lamden Testnet",
        network_symbol: "DTAU",
        currentStampRatio: 13,
        stamps: {
            burn: 65,
            approval: 65,
            coinFlip: 300
        }
    }
}