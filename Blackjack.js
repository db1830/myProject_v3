
let hidden;
let dlrSum = 0, p01Sum = 0, p02Sum = 0;
let dlrAceCount = 0, p01AceCount = 0, p02AceCount = 0;
let initCounter=0;

const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const types = ['C', 'D', 'H', 'S'];
const deck = [];

function initialize() {
    console.log(initCounter,deck, 'init' );
    initCounter++;
    getDeck();
    shuffle();
    
}


function getDeck() {

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]);
        }
    }
}


function shuffle() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function generateDealerCards() {
    const arrCards = [];
    while (dlrSum < 17) {
        let card = deck.pop();
        dlrSum += getValue(card);
        arrCards.push(card);
    }
    return {
        arrCards,
        dlrSum
    };
}

function generatePlayerCards() {
    const cards = []
    for (let i = 0; i < 2; i++) {
        cards.push(deck.pop());
    }
    return cards;
}

// init dealer cards into front 
function showDealerCards(delearCards) {
    let i = 0

    for (; i < delearCards.length - 1; i++) {
        let cardImg = document.createElement("img");
        cardImg.src = "./img_cards/" + delearCards[i] + ".png";
        document.getElementById("dlrCards").append(cardImg);
    }
    hidden = delearCards[i];


}


function calculateScore(playerCards, playerId){
    for (let i = 0; i < playerCards.length; i++) {
        if (playerId == 1) {
            p01Sum += getValue(playerCards[i]);
            p01AceCount += checkingAce(playerCards[i]);
        } else {
            p02Sum += getValue(playerCards[i]);
            p02AceCount += checkingAce(playerCards[i]);
        }
    }    
}





// show player cards by playerId/name
function showPlayerCards(playerCards, playerId, hideCards = false) {
    for (let i = 0; i < playerCards.length; i++) {
        let cardImg = document.createElement("img");
        if(hideCards){
            cardImg.src = "./img_cards/BACK.png";
            
        }else{
            cardImg.src = "./img_cards/" + playerCards[i] + ".png";
        }
        if (playerId == 1) {
            document.getElementById("p01Cards").append(cardImg);
        } else {
            document.getElementById("p02Cards").append(cardImg);
        }
    }
}


function cardHandler(player01Hand, player02Hand, gameIdOfBj, username, player) {

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./img_cards/" + card + ".png";
      
    if(username == player){
        p01Sum += getValue(card);
        p01AceCount += checkingAce(card);
        document.getElementById("p01Cards").append(cardImg);
        player01Hand.push(card);
        reducedAce(p01Sum, p01AceCount);
        
    }else{
        p02Sum += getValue(card);
        document.getElementById("p02Cards").append(cardImg);
        p02AceCount += checkingAce(card);
        player02Hand.push(card);
        reducedAce(p02Sum, p02AceCount);

    }    
    updateHandsPostRequest({ player01Hand, player02Hand }, gameIdOfBj, username);
}



function setWinner(winner) {
    updateWinnerRequest({ winner, gameId });
    
}


function btnStandClicked() {

    dlrSum = reducedAce(dlrSum, dlrAceCount);
    p01Sum = reducedAce(p01Sum, p01AceCount);
    p02Sum = reducedAce(p02Sum, p02AceCount);

    // Show all player cards without hiding
    showPlayerCards(player01Hand, 1, false);
    showPlayerCards(player02Hand, 2, false);


    document.getElementById("hidden").src = "./img_cards/" + hidden + ".png";

    let message = "";

if (dlrSum > 21) {
    message = "Dealer busts. Both players win!";
} else {
    if (p01Sum > 21) {
        message = "Player01 busts. ";
    } else if (p01Sum > dlrSum) {
        message = "Player01 wins! ";
    } else if (p01Sum == dlrSum) {
        message = "Tie between Player01 and Dealer. ";
    } else {
        message = "Dealer wins against Player01. ";
    }

    if (p02Sum > 21) {
        message = "Player02 busts. ";
    } else if (p02Sum > dlrSum) {
        message = "Player02 wins!";
    } else if (p02Sum == dlrSum) {
        message = "Tie between Player02 and Dealer.";
    } else {
        message = "Dealer wins against Player02.";
    }
}

    // let message = "";
   
    // if(dlrSum > 21){
    //     message = "Both Players Win!";
    // }else if(p01Sum == dlrSum && p02Sum == dlrSum){
    //     message = "Tie!";
    // }else if(p01Sum == dlrSum && p02Sum < dlrSum){
    //     message = "Tie between Player01 and Dealer!";
    // }else if(p02Sum == dlrSum && p01Sum < dlrSum){
    //     message = "Tie between Player02 and Dealer!";
    // }
    // else if(p02Sum == dlrSum && p01Sum > dlrSum){
    //     message = "Player01 Wins!";
    // }
    // else if(p01Sum == dlrSum && p02Sum > dlrSum){
    //     message = "Player02 Wins!";
    // }
    // else if(p01Sum > dlrSum && p01Sum > p02Sum){
    //     message = "Player01 Wins!";
    // }
    // else if(p02Sum > dlrSum && p02Sum > p01Sum){
    //     message = "Player02 Wins!";
    // }
    // else if(p01Sum == p02Sum && p01Sum > dlrSum){
    //     message = "Tie!";
    // }
    // else if(dlrSum > p01Sum && dlrSum > p02Sum){
    //     message = "Dealer Wins!";
    // }
    // else if(p01Sum > p02Sum){
    //     message = "Player01 Wins!";
    // }
    // else if(p02Sum > p01Sum){
    //     message = "Player02 Wins!";
    // }

    setWinner(message);
    showResults(dlrSum);
    document.getElementById("pResults").innerText = message;
}

function showResults(dlrSum){
    document.getElementById("dlrSum").innerText = dlrSum;
    document.getElementById("p01Sum").innerText = p01Sum;
    document.getElementById("p02Sum").innerText = p02Sum;
}

//function to get the numerical value of a card by splitting the string value and suit and returning the appropriate value
function getValue(card) {
    let splitCard = card.split('-'); //'4-D' -> ["4", "D"]
    let cardValue = splitCard[0];

    if (isNaN(cardValue)) { //A J Q K
        if (cardValue == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(cardValue);
}

//function to check if a card is an ace and returns 1 if it is, 0 otherwise.
function checkingAce(card) {
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

//function to reduce the value of a hand if the player has aces and the hand value is over 21.
// This function returns the updated hand value.

function reducedAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 1) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}


function resetBjParams(){
hidden = null;
dlrSum = 0;
p01Sum = 0;
p02Sum = 0;
dlrAceCount = 0;
p01AceCount = 0;
p02AceCount = 0;

document.getElementById("p01Cards").innerHTML = '';
document.getElementById("p02Cards").innerHTML = '';
document.getElementById("dlrSum").innerText = '';
document.getElementById("p01Sum").innerText = '';
document.getElementById("p02Sum").innerText = '';
document.getElementById("pResults").innerText = '';
}
