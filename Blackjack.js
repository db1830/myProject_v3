
let hidden;
let btnHit = true;
let currentPlayerTurn = 1;
let dlrSum = 0, p01Sum = 0, p02Sum = 0;
let dlrAceCount = 0, p01AceCount = 0, p02AceCount = 0;

const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const types = ['C', 'D', 'H', 'S'];
const deck = [];

function initialize(){
    getDeck();
    shuffle();
    
}


function getDeck(){

    for(let i =0; i< types.length; i++){
        for(let j =0; j< values.length; j++){
            deck.push(values[j] + "-" + types[i]);
        }
    }
}


function shuffle(){
    for(let i =0; i< deck.length; i++){
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function generateDealerCards(){
 
    const arrCards=[];
     
     while(dlrSum < 17){   
        
        let card = deck.pop();
        dlrSum += getValue(card);
        arrCards.push(card);
        console.log(card);
    }    
    return {
        arrCards,
        dlrSum
    };
}

function generatePlayerCards(){
    const cards = []
    for(let i =0; i< 2; i++){
     cards.push(deck.pop());
    }
    return cards;
}

// init dealer cards into front 
function showDealerCards(delearCards){
    let i = 0


     // Dealer's turn: keep hitting until the sum is at least 17
     for(; i < delearCards.length-1;i++){   
        let cardImg = document.createElement("img");
    
        cardImg.src = "./img_cards/" + delearCards[i] + ".png";

        document.getElementById("dlrCards").append(cardImg);
    }
    console.log(delearCards[i]);
    console.log(hidden);   
    hidden = delearCards[i];
    
}



// show player cards by playerId/name
 function showPlayerCards(playerCards,playerId){
    for(let i =0; i< playerCards.length;i++){
        let cardImg = document.createElement("img");
        cardImg.src = "./img_cards/" + playerCards[i] + ".png";
        if(playerId == 1){
            p01Sum += getValue(playerCards[i]);   
            p01AceCount += checkingAce(playerCards[i]);
            document.getElementById("p01Cards").append(cardImg);
        }else{
            p02Sum += getValue(playerCards[i]);   
            p02AceCount += checkingAce(playerCards[i]);
            document.getElementById("p02Cards").append(cardImg);
        }
        }

 }


function btnHitClicked() {
    if (!btnHit) {
        return;
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./img_cards/" + card + ".png";

    if (currentPlayerTurn == 1) {
        p01Sum += getValue(card);
        p01AceCount += checkingAce(card);
        document.getElementById("p01Cards").append(cardImg);
        player01Hand.push(card);
        if (reducedAce(p01Sum, p01AceCount) > 21) {
            btnHit = false;
        }
        currentPlayerTurn = 2;
    } else {
        p02Sum += getValue(card);
        document.getElementById("p02Cards").append(cardImg);
        p02AceCount += checkingAce(card);
        player02Hand.push(card);
        if (reducedAce(p02Sum, p02AceCount) > 21) {
            btnHit = false;
        }
        currentPlayerTurn = 1;

    }
    
    updateHandsPostRequest({ player01Hand, player02Hand },gameId);
}



function setWinner(name){
    updateWinnerRequest({ name, gameId });
}


function btnStandClicked() {
    if (currentPlayerTurn == 1) {
        currentPlayerTurn = 2;
    }

    dlrSum = reducedAce(dlrSum, dlrAceCount);
    p01Sum = reducedAce(p01Sum, p01AceCount);
    p02Sum = reducedAce(p02Sum, p02AceCount);

    btnHit = false;
    document.getElementById("hidden").src = "./img_cards/" + hidden + ".png";

    let message = "";
    if(p01Sum > 21){
        message = "Player02 Wins!";
    }
    else if(p02Sum > 21){
        message = "Player01 Wins!";

    }
    else if(dlrSum > 21 && p02Sum > 21){
        message = "Player01 Wins!";

    }
    else if(dlrSum > 21 && p01Sum > 21){
        message = "Player02 Wins!";

    }
    else if(p01Sum == dlrSum && p02Sum == dlrSum){
        message = "Tie!";

    }
    else if(p01Sum == dlrSum && p02Sum > dlrSum){
        message = "Player02 Wins!";

    }
    else if(p01Sum == dlrSum && p02Sum < dlrSum){
        message = "Player01 Wins!";

    }
    else if(p02Sum == dlrSum && p01Sum > dlrSum){
        message = "Player01 Wins!";

    }
    else if(p02Sum == dlrSum && p01Sum < dlrSum){
        message = "Player02 Wins!";

    }
    else if(p01Sum > dlrSum && p01Sum > p02Sum){
        message = "Player01 Wins!";

    }
    else if(p02Sum > dlrSum && p02Sum > p01Sum){
        message = "Player02 Wins!";

    }
    else if(p01Sum == p02Sum){
        message = "Tie!";

    }
    else if(p01Sum > p02Sum){
        message = "Player01 Wins!";

    }
    else if(p02Sum > p01Sum){
        message = "Player02 Wins!";
       

    }

    setWinner(message)
    document.getElementById("dlrSum").innerText = dlrSum;
    document.getElementById("p01Sum").innerText = p01Sum;
    document.getElementById("p02Sum").innerText = p02Sum;
    document.getElementById("pResults").innerText = message;

}


//function to get the numerical value of a card by splitting the string value and suit and returning the appropriate value
function getValue(card){
    let splitCard = card.split('-'); //'4-D' -> ["4", "D"]
    let cardValue = splitCard[0];

    if(isNaN(cardValue)){ //A J Q K
        if(cardValue == "A"){
            return 11;
        }
        return 10;
    }
    return parseInt(cardValue);
}

//function to check if a card is an ace and returns 1 if it is, 0 otherwise.
function checkingAce(card){
    if(card[0] == "A"){
        return 1;
    }
    return 0;
}

//function to reduce the value of a hand if the player has aces and the hand value is over 21.
// This function returns the updated hand value.

function reducedAce(playerSum,playerAceCount){
    while(playerSum > 21 && playerAceCount > 0){
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}

