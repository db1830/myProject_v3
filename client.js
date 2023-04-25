
let divLogin, divLobby, divGame;
let pLoginMessage, txtUsername, txtPassword;
let username, password;
let divUsersInLobby;
let btnLeaveGame;
let gameId, lblGameId;
let gameStatus;
let playerOne;
let playerTwo;


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
  

// This function is responsible for fetching the users in the lobby
function getLobby() {    
    // Send a GET request to the lobby endpoint
    sendHttpGetRequest('api/get_lobby?username=' + username + '&password=' + password, 
    (response)=> {
      // Parse the result to get the list of users in the lobby
      const usersInLobby = JSON.parse(response);
      // Remove all child nodes from the div that displays the users in the lobby
      removeAllChildNodes(divUsersInLobby);
      // Flag to indicate if the current user exists in the lobby list
      let existsInList = false;
      // Loop through the users in the lobby
      for (let i = 0; i < usersInLobby.length; i++) {
        // Skip the current user
        if (usersInLobby[i].username == username) {
          existsInList = true;
          continue;
        }
      
        const p = document.createElement('p');
        p.innerHTML = usersInLobby[i].username;
        // Add the p element as a child node to the div that displays the users in the lobby
        divUsersInLobby.appendChild(p);
        // Attach an onclick event listener to the p element to start a game with the user
        p.onclick = (event)=> {
          const partner = event.target.innerHTML;
          sendHttpGetRequest('api/start_game?username=' + username + '&password=' + password + '&partner=' + partner,
          (response)=> {
            if (response == 'error') {
              alert('Error, please try again.');
            }
          });

        };

      }
      // If the current user exists in the lobby list, recursively call the getLobby function after a timeout of 500ms
      if (existsInList) {
        setTimeout(getLobby, 600);
      } else {
        // If the current user does not exist in the lobby list, fetch the game ID for the current user
        // Send a GET request to the game ID endpoint
        sendHttpGetRequest('api/get_game_id?username=' + username + '&password=' + password,
        (response)=> {
          console.log('Client received response:', response);
          if (response) {
            // Parse the response and set the game ID for the current user
            // gameId = parseInt(response);
            let res = JSON.parse(response);
            console.log('Parsed response:', res);
            // Update the label to display the game ID for the current user
            lblGameId.innerHTML = 'Your game id is: ' + res.id;
            playerOne.innerHTML= "player01: " + res.player01;
            playerTwo.innerHTML= "player02: " + res.player02;
            show(divGame);
          }
        });
      }
    });
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



function getGameStatus(){
  sendHttpGetRequest('api/get_game_status?username='+username+'&password='+password+'&id='+gameId , (response)=>{
    gameStatus = JSON.parse(response);
    if(gameStatus.active){


      setTimeout(getGameStatus, 600);
        return;
        
        
    }else{
      show(divLobby);
      getLobby();
    }

    
  });
  
}







