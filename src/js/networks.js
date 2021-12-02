
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
                networkType: "mainnet",
                contractName: "con_gamma_phi_house_v1",
            },
            lottery: {
                networkType: "mainnet",
                contractName: "con_gamma_phi_lottery_v1",
            },
            wheelSpin: {
                networkType: "mainnet",
                contractName: "con_gamma_phi_house_v1",
            },
            diceRoll: {
                networkType: "mainnet",
                contractName: "con_gamma_phi_house_v1",
            }
        },
        coins: {
            phi: {
                networkType: "mainnet",
                contractName: "con_phi",
            }
        },
        purchase: {
            networkType: "mainnet",
            contractName: "con_gamma_phi_sales_v2",
        },
        app: {
            appName: "Gamma Phi", // Your DAPPS's name
            version: "1.0.1", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_gamma_phi_house_v1", // Will never change
            networkType: "mainnet", // other option is 'mainnet' 
        },
        stamps: {
            burn: 200,
            approval: 200,
            coinFlip: 1000,
            wheelSpin: 1000,
            diceRoll: 1000,
            lottery: 1000,
            purchase: 500,
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
                contractName: "con_gamma_phi_house_v1",
            },
            lottery: {
                networkType: "testnet",
                contractName: "con_gamma_phi_lottery_v1",
            },
            wheelSpin: {
                networkType: "testnet",
                contractName: "con_gamma_phi_house_v1",
            },
            diceRoll: {
                networkType: "testnet",
                contractName: "con_gamma_phi_house_v1",
            },
        },
        purchase: {
            networkType: "testnet",
            contractName: "con_gamma_phi_sales_v2",
        },
        coins: {
            phi: {
                networkType: "testnet",
                contractName: "con_phi",
            }
        },
        app: {
            appName: "Gamma Phi", // Your DAPPS's name
            version: "1.0.1", // any version to start, increment later versions to update connection info
            logo: "/static/logo-512.png", // or whatever the location of your logo
            background: "/static/wallet/background.jpg", // or whatever the location of your logo
            contractName: "con_gamma_phi_house_v1", // Will never change
            networkType: "testnet", // other option is 'mainnet' 
        },
        networkName: "Lamden Testnet",
        network_symbol: "DTAU",
        currentStampRatio: 13,
        stamps: {
            burn: 200,
            approval: 200,
            coinFlip: 1000,
            wheelSpin: 1000,
            diceRoll: 1000,
            lottery: 1000,
            purchase: 500,
        }
    }
}