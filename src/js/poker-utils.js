
export const ONE_CARD_POKER = 0;
export const BLIND_POKER = 1;
export const STUD_POKER = 2;
export const NO_LIMIT = 0;
export const POT_LIMIT = 1;

export const formatHand = (handStr) => {
    console.log("Formatting hand: "+handStr);
    let h = handStr.split(":")
    if (h.length === 2) {
        h = [h[0]]
    }
    let cards = h[0].split(",");
    return cards.map((v)=>formatCardShort(v)).join(" ");
};

export const formatCardShort = (cardStr) => {
    let suits = [`♣︎`, `♦︎`, `♥︎`, `♠︎`];
    console.log("Formatting card: "+cardStr);
    let h = cardStr.split(":")
    if (h.length === 2) {
        h = [h[0]]
    }
    if (h.length == 1 && h[0].length == 2) {
        let card = h[0];
        let text = "" + card[0];
        if (card[1] === 's') {
            text += suits[3];
        } else if (card[1] === 'd') {
            text += suits[1];
        } else if (card[1] === 'h') {
            text += suits[2];
        } else if (card[1] === 'c') {
            text += suits[0];
        }
    }
}

export const formatCardLong = (cardStr) => {
    console.log("Formatting card: "+cardStr);
    let h = cardStr.split(":")
    if (h.length === 2) {
        h = [h[0]]
    }
    if (h.length == 1 && h[0].length == 2) {
        let card = h[0];
        let text = "";
        if (card[0] === 'A') {
            text += "Ace";
        } else if (card[0] === 'K') {
            text += "King"
        } else if (card[0] === 'Q') {
            text += "Queen"
        } else if (card[0] === 'J') {
            text += "Jack"
        } else if (card[0] === 'T') {
            text += "10"
        } else {
            text += card[0];
        }
        text += " of ";
        if (card[1] === 's') {
            text += "Spades"
        } else if (card[1] === 'd') {
            text += "Diamonds"
        } else if (card[1] === 'h') {
            text += "Hearts"
        } else if (card[1] === 'c') {
            text += "Clubs"
        }
        return text
    }
    return handStr;
}