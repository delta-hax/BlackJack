export default class Card {
    constructor(suit, value) {
      this.suit = suit;
      this.value = value;
    }
  
    getImage() {
      cardImg = document.createElement("img");
      cardImg.src = "./cards/" + this.value + "-" + this.suit + ".png";
      return cardImg
    }
  
    getValue() {
      if (this.value == "A") {
        return 11
      } else if (this.value == "J" || this.value == "Q" || this.value == "K") {
        return 10;
      } else {
        return parseInt(this.value);
      }
    }
  }