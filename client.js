
let divLogin, divLobby, divGame;
let pLoginMessage, txtUsername, txtPassword;
let username, password;
let divUsersInLobby;
let btnLeaveGame;
let gameId, lblGameId;
let gameStatus;
let playerOne;
let playerTwo;
let player;
let player01Hand=[];
let player02Hand=[];
let btnHit;
let hasWinner = false;


// initialize the game 
function init() {
  divLogin = document.getElementById('divLogin');
  divLobby = document.getElementById('divLobby');
  divGame = document.getElementById('divGame');
  pLoginMessage = document.getElementById('pLoginMessage');
  txtUsername = document.getElementById('txtUsername');
  txtPassword = document.getElementById('txtPassword');
  divUsersInLobby = document.getElementById('divUsersInLobby');
  btnLeaveGame = document.getElementById('btnLeaveGame');
  lblGameId = document.getElementById('lblGameId');
  playerOne = document.getElementById('player1');
  playerTwo = document.getElementById('player2');
  btnHit = document.getElementById('btnHit');

  txtUsername.focus();
}


// a function to remove all child nodes
function removeAllChildNodes(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  
  // Define a function to show an element by adding the 'shown' class and removing the 'hidden' class
  function show(element) {
    // Find any elements that are already shown and hide them
    let shown = document.getElementsByClassName('shown');
    if (shown.length == 1) {
      shown[0].classList.add('hidden');
      shown[0].classList.remove('shown');
    }
    // Show the new element by adding the 'shown' class and removing the 'hidden' class
    element.classList.add('shown');
    element.classList.remove('hidden');
  }
  





  function getLobby() {
    sendHttpGetRequest('api/get_lobby?username=' + username + '&password=' + password, (response) => {
      const usersInLobby = JSON.parse(response);
      removeAllChildNodes(divUsersInLobby);
      let existsInList = false;
  
      for (let i = 0; i < usersInLobby.length; i++) {
          if (usersInLobby[i].username == username) {
          existsInList = true;
          continue;
        }
  
        const p = document.createElement('p');
        p.innerHTML = usersInLobby[i].username;
        divUsersInLobby.appendChild(p);
  
        p.onclick = (event) => {
          const partner = event.target.innerHTML;
          const dealerSetting = generateDealerCards();
          player01Hand = generatePlayerCards();
          player02Hand = generatePlayerCards();
          const dealerHand = dealerSetting.arrCards;
          const dealerScore = dealerSetting.dlrSum;
          startGamePostRequest({ dealerHand, player01Hand, player02Hand, dealerScore },username, partner, (response) => {

            if (response == 'error') {
              alert('Error, please try again.');
            }
          });
        };
      }
  
      if (existsInList) {
        setTimeout(getLobby, 1000);
      } else {
        getGameId();

      } 
      
    });
  }
  
  function getGameId() {
    sendHttpGetRequest('api/get_game_id?username=' + username + '&password=' + password, (response) => {
      if(response){
      const res = JSON.parse(response);
      gameId = res.id;
      lblGameId.innerHTML = 'Your game id is: ' + res.id;
      playerOne.innerHTML = "player01: " + res.player;
      playerTwo.innerHTML = "player02: " + res.partner; 
      player = res.player;    

      if(res.player == username){
        calculateScore(JSON.parse(res.player01Hand), 1);
        calculateScore(JSON.parse(res.player02Hand), 2);
        showPlayerCards(JSON.parse(res.player01Hand), 1, false);
        showPlayerCards(JSON.parse(res.player02Hand), 2, true);
      }else{
        player01Hand = JSON.parse(res.player01Hand);
        player02Hand = JSON.parse(res.player02Hand);

        calculateScore(JSON.parse(res.player02Hand), 2);
        calculateScore(JSON.parse(res.player01Hand), 1);
        showPlayerCards(JSON.parse(res.player02Hand), 2, false);
        showPlayerCards(JSON.parse(res.player01Hand), 1, true);
      }
      showDealerCards(JSON.parse(res.dealer_hand));
      dlrSum = JSON.parse(res.dealerScore);

      show(divGame);
      setTimeout(gameCheck, 1000);
      }
    });
  }

  // rendering  the player cards when it updated every change 
  function renderCards(gameInfo)
  {
      if(gameInfo)
      {

          const player1CardLen = JSON.parse(gameInfo.player01_hand).length;
          const player2CardLen = JSON.parse(gameInfo.player02_hand).length;
            
          if(player1CardLen > player01Hand.length)
          {
            const newCards = JSON.parse(gameInfo.player01_hand).filter((item, index)=> item != player01Hand[index]);
            player01Hand = player01Hand.concat(newCards);
            if(gameInfo.player01 == username){
              showPlayerCards(player01Hand, 1, false);
            }else{
              showPlayerCards(newCards, 1, true);
            }
            calculateScore(newCards, 1);
          }

          if(player2CardLen > player02Hand.length)
          {
              const newCards = JSON.parse(gameInfo.player02_hand).filter((item, index)=> item != player02Hand[index]);
              player02Hand = player02Hand.concat(newCards);
              if(gameInfo.player02 == username){
                showPlayerCards(player02Hand, 2, false);
              }else{
                showPlayerCards(newCards, 2, true);
              }
              calculateScore(newCards, 2);
          }
          if(gameInfo.winner && !hasWinner)
          {
            hasWinner = true;
            showResults(dlrSum);
            document.getElementById("hidden").src = "./img_cards/" + hidden + ".png";
            document.getElementById("pResults").innerText = gameInfo.winner;
            document.getElementById("p01Cards").innerHTML = '';
            document.getElementById("p02Cards").innerHTML = '';
            showPlayerCards(player01Hand, 1, false);
            showPlayerCards(player02Hand, 2, false);
           
            setTimeout(()=>{
              alert("End of game, you are going back to lobby!");
              sendHttpGetRequest('/api/leave_game?username='+username+'&password='+password,(response)=>{
                if(response == "ok"){
                    
                  }
              });

            },10000); 
          }
    }
    setTimeout(gameCheck,1000);
  }
  

function clearAllCards() {

  const elementsToClear = ["p01Cards", "p02Cards", "dlrCards"];
  elementsToClear.forEach((elementId) => {
      const element = document.getElementById(elementId);
      for (let i = 0; i < element.childNodes.length; i++) {
          const childNode = element.childNodes[i];
          if (!(childNode.id == "hidden")) {
              element.removeChild(childNode);
              // after removing a node, the list will be added, 
              // so we need to decrement the index to not skip any node.
              i--; 
          } else {
              childNode.src = "./img_cards/BACK.png";
          }
      }
  });
}

  function btnHitClicked() {
    cardHandler(player01Hand, player02Hand, gameId, username, player);
}

    
function btnLoginSignupClicked(loginOrSignup) {
    username = txtUsername.value;
    password = txtPassword.value;
    if (!username || !password) { // Make sure the username and password are not empty
        alert("Please enter a username and password");
        return;
    }

    // Get all elements with the class "lock" and disable them
    let elements = document.getElementsByClassName("lock");
        for(let e in elements){
            e.disabled = true;
        }

    // Clear the login message
    removeAllChildNodes(pLoginMessage);

    // Send a GET request to the server to log in or sign up
    sendHttpGetRequest("api/" + loginOrSignup + "?username=" + username + "&password=" + password, 
    (response) => {
        // Restart all elements with the class "lock"
        for(let e in elements){
          e.disabled = false;
      }
        // Handle the server response
        switch (response) {
            case "ok":
                // If the login or signup was successful, show the lobby and fetch the lobby data
                show(divLobby);
                getLobby();
                
                break;
            case "invalid":
                
                pLoginMessage.innerHTML = "Invalid username or password.";
                break;
            case "taken":
                pLoginMessage.innerHTML = "Username already taken.";
                break;
            default:
                // If the server response is not recognized, display a generic error message
                pLoginMessage.innerHTML = "An error occurred. Please try again.";
                break;
        }
    }, (error) => {
        // Restart all elements with the "lock" class and display an error message
        for (let i = 0; i < elements.length; i++) {
            elements[i].disabled = false;
        }
        pLoginMessage.innerHTML = "Error: " + error;
    });
}



function btnLeaveGameClicked(){
  let elements = document.getElementsByClassName("lock");
  for(let e in elements){
      e.disabled = true;
  }
  //send http request to "leave game"...
  sendHttpGetRequest('api/leave_game?username='+username+'&password='+password, (response)=>{
      for(let e in elements){
          e.disabled = false;
      }
      if(response == "ok"){
          show(divLobby);
          getLobby();
      }
  });
}

 

function gameCheck(){
  sendHttpGetRequest('api/game_check?username='+username+'&password='+password+'&id='+gameId , (response)=>{
    let parseResponse = JSON.parse(response);
    if(parseResponse.active){ 
        const gameStatus = {
          player01: parseResponse.player01,
          player02: parseResponse.player02,     
          dealer_hand: parseResponse.dealer_hand,
          player01_hand: parseResponse.player01_hand, 
          player02_hand: parseResponse.player02_hand,
          winner: parseResponse.winner,
          dealerScore: parseResponse.dealer_score,
      };
      btnHit.disabled = parseResponse.last_action == username;
      renderCards(gameStatus);
    }else{
      clearAllCards();
      resetGame();
      resetBjParams();
      show(divLobby);
      getLobby();
    }
  });
}



function resetGame(){
  gameId = null;
  gameStatus = null;
  lblGameId.innerHTML = '';
  playerOne.innerHTML = '';
  playerTwo.innerHTML = '';
  player = null;
  player01Hand = [];
  player02Hand = [];
  hasWinner = false;
}



