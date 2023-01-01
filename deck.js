const SUITS = ["♠", "♣", "♥", "♦"]
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const CARD_VALUE_MAP = {"2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 10, Q: 10, K: 10, A: 11}
const DECKS_IN_SHOE = 6;

export default class Deck {
  constructor(cards = newShoe()) {
    this.cards = cards
    this.runningCount = 0;
  }

  get numberOfCards() {
    return this.cards.length
  }

  pop() {
    let card = this.cards.shift();
    this.runningCount += card.getCardCountValue();
    return card
  }

  shuffle() {
    for (let i = this.numberOfCards - 1; i > 0; i--) {
      const newIndex = Math.floor(Math.random() * (i + 1))
      const oldValue = this.cards[newIndex]
      this.cards[newIndex] = this.cards[i]
      this.cards[i] = oldValue
    }
  }
}

class Card {
  constructor(suit, value) {
    this.suit = suit
    this.value = value
  }

  get color() {
    return this.suit === "♣" || this.suit === "♠" ? "black-card" : "red-card"
  }

  get html() {
    const cardDiv = document.createElement("div")
    cardDiv.innerText = this.value + this.suit;
    cardDiv.classList.add(this.color)
    return cardDiv
  }

  getCardCountValue() {
    if (CARD_VALUE_MAP[this.value] <= 6) {
        return 1
    } else if (CARD_VALUE_MAP[this.value] >= 10) {
        return -1
    } else {
        return 0
    }
  }
}

function newShoe() { 
  let shoe = [];
  for (let i = 0; i < DECKS_IN_SHOE; ++i) {
    shoe = shoe.concat(freshDeck())
  }
  return shoe;
}

function freshDeck() {
    return SUITS.flatMap(suit => {
      return VALUES.map(value => {
        return new Card(suit, value)
      })
    })
  }