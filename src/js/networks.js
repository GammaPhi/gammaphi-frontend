
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
        masterNodeLink: "https://masternode-01.lamden.io",
        blockexplorer_tx: "transactions",
        blockexplorer_address: "addresses",
        wallet_install_url: "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim",
        networkName: "Lamden Mainnet",
        network_symbol: "TAU",
        currentStampRatio: 65,
        games: {
            coinFlip: {
                networkType: "testnet",
                contractName: "con_test_eh_game_v9",
            }
        },
        coins: {
            phi: {
                networkType: "testnet",
                contractName: "con_eh_game_token_1",
            }
        },
        app: {
            appName: "GammaPhi", // Your DAPPS's name
            version: "0.0.1", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_test_eh_game_v9", // Will never change
            networkType: "testnet", // other option is 'mainnet' 
        },
        stamps: {
            burn: 65,
            approval: 65,
            coinFlip: 500
        }
    }
}

export const testnet = {
    lamden: {
        apiLink: "https://testnet.lamden.io/api",
        blockexplorer: "https://testnet.lamden.io",
        masterNodeLink: "https://testnet-master-1.lamden.io",
        blockexplorer_tx: "transactions",
        blockexplorer_address: "addresses",
        wallet_install_url: "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim",
        games: {
            coinFlip: {
                networkType: "testnet",
                contractName: "con_test_eh_game_v9",
            },
            lottery: {
                networkType: "testnet",
                contractName: "con_test_eh_lottery_v4",
            }
        },
        coins: {
            phi: {
                networkType: "testnet",
                contractName: "con_eh_game_token_1",
            }
        },
        app: {
            appName: "GammaPhi", // Your DAPPS's name
            version: "0.0.1", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_test_eh_game_v9", // Will never change
            networkType: "testnet", // other option is 'mainnet' 
        },
        networkName: "Lamden Testnet",
        network_symbol: "DTAU",
        currentStampRatio: 13,
        stamps: {
            burn: 65,
            approval: 65,
            coinFlip: 500
        }
    }
}