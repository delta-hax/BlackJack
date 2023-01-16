import Deck from "./deck.js"

const CARD_VALUE_MAP = {"2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 10, Q: 10, K: 10, A: 11}
const SHOE_COUNT = document.querySelector(".shoe-count");
const CARD_COUNT = document.querySelector(".card-count");
const DEALER = document.querySelector(".dealer");
const USER_HAND_HTML = document.querySelector(".user-hand");
const USER_RESULT_HTML = document.querySelector(".user-result");
const DEALER_HAND_HTML = document.querySelector(".dealer-hand");
const DEALER_RESULT_HTML = document.querySelector(".dealer-result");
const P1_HAND_HTML = document.querySelector(".player-one-hand");
const P1_RESULT_HTML = document.querySelector(".player-one-result");
const P2_HAND_HTML = document.querySelector(".player-two-hand");
const P2_RESULT_HTML = document.querySelector(".player-two-result");
const P3_HAND_HTML = document.querySelector(".player-three-hand");
const P3_RESULT_HTML = document.querySelector(".player-three-result");
const HIT_BTN = document.querySelector(".hit");
const STAY_BTN = document.querySelector(".stay");

let deck, userCards, p1Cards, p2Cards, p3Cards, dealerCards;

async function startGame() {
    if (!deck || deck.numberOfCards <= 78) {
        deck = new Deck();
        deck.shuffle();
    }
    cleanBeforeRound();
    await dealCards();
    cpuMove(p1Cards, P1_HAND_HTML, P1_RESULT_HTML);
    await new Promise(resolve => setTimeout(resolve, 1000));
    cpuMove(p2Cards, P2_HAND_HTML, P2_RESULT_HTML);
    await new Promise(resolve => setTimeout(resolve, 1000));
    cpuMove(p3Cards, P3_HAND_HTML, P3_RESULT_HTML);
    await new Promise(resolve => setTimeout(resolve, 1000));
    userMove();
}

startGame()


// game logic

async function dealCards() {
    let playerHands = [p1Cards, p2Cards, p3Cards, userCards, dealerCards];
    let playerHandsHtml = [P1_HAND_HTML, P2_HAND_HTML, P3_HAND_HTML, USER_HAND_HTML, DEALER_HAND_HTML];
    for (let i = 0; i < 2; ++i) {
        for (let j = 0; j < playerHands.length; ++j) {
            let card = deck.pop();
            playerHands[j].push(card);
            let dealersHiddenCard = playerHandsHtml[j] == DEALER_HAND_HTML && i == 1;
            if (!dealersHiddenCard) {
                playerHandsHtml[j].appendChild(card.html);
                updateShoeCount();
                updateCardCount();
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
}

function cpuMove(playerHand, playerHandHtml, playerResult) {
    let sum = getPlayerHandSum(playerHand);
    let playerHits = Math.random() < 0.5 || sum <= 11;
    if (naturalHand(playerHand)) {
        playerResult.innerHTML = "natural";
        return;
    } else if (sum > 21) {
        playerResult.innerHTML = "bust";
        return;
    } else if (sum >= 19 || !playerHits) {
        playerResult.innerHTML = "stay";
        return;
    } else {
        hit(playerHand, playerHandHtml);
        cpuMove(playerHand, playerHandHtml, playerResult);
        return;
    }
}

function userMove() {
    HIT_BTN.classList.remove('disabled');
    STAY_BTN.classList.remove('disabled');
    if (naturalHand(userCards)) {
        USER_RESULT_HTML.innerHTML = "natural";
        dealerMove()
        return;
    }
    HIT_BTN.addEventListener('click', userHits);
    STAY_BTN.addEventListener('click', userStays);
}

function dealerMove() {
    cleanUpAfterUserMove();
    DEALER_HAND_HTML.appendChild(dealerCards[1].html);
    if (naturalHand(dealerCards)) {
        DEALER_RESULT_HTML.innerHTML = "natural";
        declareWinners();
        return;
    }
    while (getPlayerHandSum(dealerCards) <= 16) {
        hit(dealerCards, DEALER_HAND_HTML);
    }
    if (getPlayerHandSum(dealerCards) > 21) {
        DEALER_RESULT_HTML.innerHTML = "bust";
    } else {
        DEALER_RESULT_HTML.innerHTML = "stay";
    }
    declareWinners();
}

function nextRound() {
    let nextButton = document.createElement("button")
    nextButton.innerText = 'next round';
    nextButton.classList.add('next-round');
    DEALER.appendChild(nextButton);
    document.querySelector(".next-round").addEventListener('click', () => { 
        DEALER.removeChild(DEALER.lastChild);
        startGame(); 
    });
}

function declareWinners() {
    let dealerSum = getPlayerHandSum(dealerCards);
    let playerResults = [P1_RESULT_HTML, P2_RESULT_HTML, P3_RESULT_HTML, USER_RESULT_HTML]
    let playerSums = [getPlayerHandSum(p1Cards), getPlayerHandSum(p2Cards), getPlayerHandSum(p3Cards), getPlayerHandSum(userCards)]
    for (let i = 0; i < playerResults.length; ++i) {
        if (playerSums[i] <= 21 && dealerSum > 21) {
            playerResults[i].innerHTML = "WIN";
        } else if (dealerSum > 21) {
            continue;
        } else if (playerSums[i] <= 21 && playerSums[i] > dealerSum) {
            playerResults[i].innerHTML = "WIN";
        } else if (playerSums[i] == dealerSum) {
            playerResults[i].innerHTML = "TIE";
        } else if (playerSums[i] < dealerSum) {
            playerResults[i].innerHTML = "LOSE";
        }
    }
    nextRound();
}


// clean up functions

function cleanBeforeRound() {
    p1Cards = [];
    p2Cards = [];
    p3Cards = [];
    userCards = [];
    dealerCards = [];
    P1_HAND_HTML.innerHTML = "";
    P2_HAND_HTML.innerHTML = "";
    P3_HAND_HTML.innerHTML = "";
    USER_HAND_HTML.innerHTML = "";
    DEALER_HAND_HTML.innerHTML = "";
    P1_RESULT_HTML.innerHTML = "";
    P2_RESULT_HTML.innerHTML = "";
    P3_RESULT_HTML.innerHTML = "";
    USER_RESULT_HTML.innerHTML = "";
    DEALER_RESULT_HTML.innerHTML = "";
    updateShoeCount();
    updateCardCount();
}

function cleanUpAfterUserMove() {
    HIT_BTN.classList.add('disabled');
    STAY_BTN.classList.add('disabled');
    HIT_BTN.removeEventListener('click', userHits);
    STAY_BTN.removeEventListener('click', userStays);
}


// helpers

function naturalHand(playerHand) {
    return getPlayerHandSum(playerHand) == 21 && playerHand.length == 2;
}

function updateShoeCount() {
    SHOE_COUNT.innerHTML = `Cards In Shoe: ${deck.numberOfCards}`
}

function updateCardCount() {
    CARD_COUNT.innerHTML = `Running Count: ${deck.runningCount}`
}

function userStays(event) {
    USER_RESULT_HTML.innerHTML = "stay";
    dealerMove();
    return;
}

function userHits(event) {
    hit(userCards, USER_HAND_HTML);
    if (getPlayerHandSum(userCards) > 21) {
        USER_RESULT_HTML.innerHTML = "bust";
        dealerMove();
    }
}

function hit(playerHand, playerHandHtml) {
    let card = deck.pop();
    playerHand.push(card);
    playerHandHtml.appendChild(card.html);
    updateShoeCount();
    updateCardCount();
}

function getPlayerHandSum(playerHand) {
    let sum = 0;
    let aces = 0;
    for (let card of playerHand) {
        sum += CARD_VALUE_MAP[card.value];
        card.value == "A" ? aces += 1 : null;
    }
    if (sum > 21 && aces) {
        sum -= 10;
    }
    return sum;
}