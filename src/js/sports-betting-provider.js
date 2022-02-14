
const DEFAULT_PROVIDER_URL = "https://bet.gammaphi.io"


export const SPORTS_METADATA = {
    sports: [
        'boxing',
        'mlb',
        'nba',
        'ncaab',
        'ncaaf',
        'nfl',
        'nhl',
        'soccer',
        'tennis',
        'ufc'
    ],
    subCategories: {
        soccer: {
            'soccer-brazil-serie-a': 'Brazil Serie A',
            'soccer-bundesliga': 'Bundesliga',
            'soccer-champions-league': 'Champions League',
            'soccer-epl': 'English Premier League',
            'soccer-liga-mx': 'Liga MX',
            'soccer-ligue1': 'Ligue 1',
            'soccer-mls': 'MLS',
            'soccer-serie-a': 'Serie A',
            'soccer-world-cup': 'World Cup'
        }
    },
    displayNames: {
        boxing: 'Boxing',
        mlb: 'MLB',
        nba: 'NBA',
        ncaab: 'College Basketball',
        ncaaf: 'College Football',
        nfl: 'NFL',
        nhl: 'NHL',
        soccer: 'Soccer',
        tennis: 'Tennis',
        ufc: 'UFC',
    }
}


export async function listWagersForGame(game, wagerType) {
    try {
        let endpoint;
        if (wagerType === 'spread') {
            endpoint = 'spreads'
        } else if (wagerType === 'moneyline') {
            endpoint = 'moneylines'
        } else if (wagerType === 'total') {
            endpoint = 'totals'
        } else {
            return [];
        }
        let url = `${DEFAULT_PROVIDER_URL}/${endpoint}`
        const filters = {
            sport: game.sport,
            away_team: game.away_team,
            home_team: game.home_team,
            date: game.date,
        }
        console.log("Wager filters: ");
        console.log(filters);
        const res = await fetch(
            url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            },
        )
        if (res.status === 200) {
            let json = await res.json()
            const data = json.data || []
            if (wagerType === 'spread') {
                const spreadsSeen = new Set()
                const ret = [];
                for (let i = 0; i < data.length; i++) {
                    let spread = data[i].away_spread["$numberDecimal"];
                    if (!spreadsSeen.has(spread)) {
                        ret.push(data[i]);
                        spreadsSeen.add(spread);
                    }
                }
                return ret;
            } else if (wagerType === 'total') {
                const totalsSeen = new Set()
                const ret = [];
                for (let i = 0; i < data.length; i++) {
                    let total = data[i].away_total["$numberDecimal"];
                    if (!totalsSeen.has(total)) {
                        ret.push(data[i]);
                        totalsSeen.add(total);
                    }
                }
                return ret;
            }
            return data;
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
}


export async function listGames(filters={}) {
    try {
        let url = `${DEFAULT_PROVIDER_URL}/events`
        const res = await fetch(
            url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            },
        )
        if (res.status === 200) {
            let json = await res.json()
            return json.data || []
        } else {
            return []
        }
    } catch (error) {
        return [];
    }
}