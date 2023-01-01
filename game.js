import Deck from "./deck.js"

const CARD_VALUE_MAP = {"2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 10, Q: 10, K: 10, A: 11}
const shoeCount = document.querySelector(".shoe-count");
const cardCount = document.querySelector(".card-count");
const dealerElement = document.querySelector(".dealer");
const userHand = document.querySelector(".user-hand");
const userResult = document.querySelector(".user-result");
const dealerHand = document.querySelector(".dealer-hand");
const dealerResult = document.querySelector(".dealer-result");
const playerOneHand = document.querySelector(".player-one-hand");
const playerOneResult = document.querySelector(".player-one-result");
const playerTwoHand = document.querySelector(".player-two-hand");
const playerTwoResult = document.querySelector(".player-two-result");
const playerThreeHand = document.querySelector(".player-three-hand");
const playerThreeResult = document.querySelector(".player-three-result");
const hitButton = document.querySelector(".hit");
const stayButton = document.querySelector(".stay");

let deck, userCards, p1Cards, p2Cards, p3Cards, dealerCards;

startGame()
async function startGame() {
    if (!deck || deck.numberOfCards <= 78) {
        deck = new Deck();
        deck.shuffle();
    }
    cleanBeforeRound();
    await dealCards();
    cpuMove(p1Cards, playerOneHand, playerOneResult);
    await new Promise(resolve => setTimeout(resolve, 1000));
    cpuMove(p2Cards, playerTwoHand, playerTwoResult);
    await new Promise(resolve => setTimeout(resolve, 1000));
    cpuMove(p3Cards, playerThreeHand, playerThreeResult);
    await new Promise(resolve => setTimeout(resolve, 1000));
    userMove();
}

function cleanBeforeRound() {
    p1Cards = [];
    p2Cards = [];
    p3Cards = [];
    userCards = [];
    dealerCards = [];
    playerOneHand.innerHTML = "";
    playerTwoHand.innerHTML = "";
    playerThreeHand.innerHTML = "";
    userHand.innerHTML = "";
    dealerHand.innerHTML = "";
    playerOneResult.innerHTML = "";
    playerTwoResult.innerHTML = "";
    playerThreeResult.innerHTML = "";
    userResult.innerHTML = "";
    dealerResult.innerHTML = "";
    updateShoeCount();
    updateCardCount();
}

async function dealCards() {
    let playerHands = [p1Cards, p2Cards, p3Cards, userCards, dealerCards];
    let playerHandsHtml = [playerOneHand, playerTwoHand, playerThreeHand, userHand, dealerHand];
    for (let i = 0; i < 2; ++i) {
        for (let j = 0; j < playerHands.length; ++j) {
            let card = deck.pop();
            playerHands[j].push(card);
            let dealersHiddenCard = playerHandsHtml[j] == dealerHand && i == 1;
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
    hitButton.classList.remove('disabled');
    stayButton.classList.remove('disabled');
    if (naturalHand(userCards)) {
        userResult.innerHTML = "natural";
        dealerMove()
        return;
    }
    hitButton.addEventListener('click', userHits);
    stayButton.addEventListener('click', userStays);
}

function dealerMove() {
    cleanUpAfterUserMove();
    dealerHand.appendChild(dealerCards[1].html);
    if (naturalHand(dealerCards)) {
        dealerResult.innerHTML = "natural";
        declareWinners();
        return;
    }
    while (getPlayerHandSum(dealerCards) <= 16) {
        hit(dealerCards, dealerHand);
    }
    if (getPlayerHandSum(dealerCards) > 21) {
        dealerResult.innerHTML = "bust";
    } else {
        dealerResult.innerHTML = "stay";
    }
    declareWinners();
}

function nextRound() {
    let nextButton = document.createElement("button")
    nextButton.innerText = 'next round';
    nextButton.classList.add('next-round');
    dealerElement.appendChild(nextButton);
    document.querySelector(".next-round").addEventListener('click', () => { 
        dealerElement.removeChild(dealerElement.lastChild);
        startGame(); 
    });
}

function cleanUpAfterUserMove() {
    hitButton.classList.add('disabled');
    stayButton.classList.add('disabled');
    hitButton.removeEventListener('click', userHits);
    stayButton.removeEventListener('click', userStays);
}

function userStays(event) {
    userResult.innerHTML = "stay";
    dealerMove();
    return;
}

function userHits(event) {
    hit(userCards, userHand);
    if (getPlayerHandSum(userCards) > 21) {
        userResult.innerHTML = "bust";
        dealerMove();
    }
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

function naturalHand(playerHand) {
    return getPlayerHandSum(playerHand) == 21 && playerHand.length == 2;
}

function hit(playerHand, playerHandHtml) {
    let card = deck.pop();
    playerHand.push(card);
    playerHandHtml.appendChild(card.html);
    updateShoeCount();
    updateCardCount();
}

function updateShoeCount() {
    shoeCount.innerHTML = `Cards In Shoe: ${deck.numberOfCards}`
}

function updateCardCount() {
    cardCount.innerHTML = `Running Count: ${deck.runningCount}`
}

function declareWinners() {
    let dealerSum = getPlayerHandSum(dealerCards);
    let p1Sum = getPlayerHandSum(p1Cards);
    let p2Sum = getPlayerHandSum(p2Cards);
    let p3Sum = getPlayerHandSum(p3Cards);
    let userSum = getPlayerHandSum(userCards);
    if (dealerSum > 21) {
        if (p1Sum <= 21) {
            playerOneResult.innerHTML = "WIN";
        }
        if (p2Sum <= 21) {
            playerTwoResult.innerHTML = "WIN";
        }
        if (p3Sum <= 21) {
            playerThreeResult.innerHTML = "WIN";
        }
        if (userSum <= 21) {
            userResult.innerHTML = "WIN";
        }
        nextRound();
        return;
    }
    if (p1Sum <= 21 && p1Sum > dealerSum) {
        playerOneResult.innerHTML = "WIN";
    } else if (p1Sum == dealerSum) {
        playerOneResult.innerHTML = "TIE";
    } else if (p1Sum < dealerSum) {
        playerOneResult.innerHTML = "LOSE";
    }
    if (p2Sum <= 21 && p2Sum > dealerSum) {
        playerTwoResult.innerHTML = "WIN";
    } else if (p2Sum == dealerSum) {
        playerTwoResult.innerHTML = "TIE";
    } else if (p2Sum < dealerSum) {
        playerTwoResult.innerHTML = "LOSE";
    }
    if (p3Sum <= 21 && p3Sum > dealerSum) {
        playerThreeResult.innerHTML = "WIN";
    } else if (p3Sum == dealerSum) {
        playerThreeResult.innerHTML = "TIE";
    } else if (p3Sum < dealerSum) {
        playerThreeResult.innerHTML = "LOSE";
    }
    if (userSum <= 21 && userSum > dealerSum) {
        userResult.innerHTML = "WIN";
    } else if (userSum == dealerSum) {
        userResult.innerHTML = "TIE";
    } else if (userSum < dealerSum) {
        userResult.innerHTML = "LOSE";
    }
    nextRound();
}