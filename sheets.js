
// This function is responsible for fetching the users in the lobby
function getLobby() {
  // Construct the endpoint URL with the username and password
  const lobbyEndpoint = 'api/get_lobby?username=' + username + '&password=' + password;
  // Send a GET request to the lobby endpoint
  sendHttpGetRequest(lobbyEndpoint, function (result) {
    // Parse the result to get the list of users in the lobby
    const usersInLobby = JSON.parse(result);
    // Remove all child nodes from the div that displays the users in the lobby
    removeAllChildNodes(divUsersInLobby);
    // Flag to indicate if the current user exists in the lobby list
    let existsInList = false;
    // Loop through the users in the lobby
    for (let i = 0; i < usersInLobby.length; i++) {
      // Skip the current user
      if (usersInLobby[i].username === username) {
        existsInList = true;
        continue;
      }
      // Create a new p element to display the username of the user in the lobby
      const p = document.createElement('p');
      p.innerHTML = usersInLobby[i].username;
      // Add the p element as a child node to the div that displays the users in the lobby
      divUsersInLobby.appendChild(p);
      // Attach an onclick event listener to the p element to start a game with the user
      p.onclick = function () {
        const partner = p.innerHTML;
        const startGameEndpoint = 'api/start_game?username=' + username + '&password=' + password + '&partner=' + partner;
        // Send a GET request to the start game endpoint with the current user and partner user as parameters
        sendHttpGetRequest(startGameEndpoint, function (response) {
          if (response === 'error') {
            alert('Error, please try again.');
          }
        });
      };
    }
    // If the current user exists in the lobby list, recursively call the getLobby function after a timeout of 500ms
    if (existsInList) {
      setTimeout(getLobby, 500);
    } else {
      // If the current user does not exist in the lobby list, fetch the game ID for the current user
      const gameIdEndpoint = 'api/get_game_id?username=' + username + '&password=' + password;
      // Send a GET request to the game ID endpoint
      sendHttpGetRequest(gameIdEndpoint, function (response) {
        if (response) {
          // Parse the response and set the game ID for the current user
          gameId = parseInt(response);
          // Update the label to display the game ID for the current user
          lblGameId.innerHTML = 'Your game id is: ' + gameId;
          // Show the div that displays the game
          show(divGame);
        }
      });
    }
  });
}






            function btnLeaveGameClicked(){
              // Get all elements with class "lock"
              let elements = document.getElementsByClassName("lock");
              
              // Disable all elements with class "lock"
              for (let i = 0; i < elements.length; i++) {
                elements[i].disabled = true;
              }
              
              // Send an API request to leave the game
              sendHttpGetRequest('api/leave_game?username=' + username + '&password=' + password, (response)=>{
                // Enable all elements with class "lock"
                for (let i = 0; i < elements.length; i++) {
                  elements[i].disabled = false;
                }
                // If the response is "ok", show the lobby and refresh it
                if(response == "ok"){
                  show(divLobby);
                  getLobby();
                }
                // If the opponent has left the game, show the lobby and display an alert
                else if(response == "opponent_left"){
                  show(divLobby);
                  alert("Opponent has left the game");
                  getLobby();
                }
                else{
                  // handle other errors here
                }
              });
            }









           if (path.startsWith("/leave_game")) {
              //how to find my partner ??
              //go over all games that I am either player1 or player2.
              //from those games, if I am i.e player1, then player2 is my partner.
              //if I am player2, then my partner is player1.
              st.query("SELECT id,player01,player02 FROM games WHERE (player01=? OR player02=?) AND active=1", [username, username], (result, err) => {
                  if (err) {
                      res.end('');
                      return;
                  }
                  if (result.length >= 1) {
                      let gameId = result[0].id;
                      let partner;
                      if (result[0].player01 == username) {
                          partner = result[0].player02;
                      } else {
                          partner = result[0].player01;
                      }
  
                      st.query("UPDATE games SET active=0 WHERE id=? AND active=1", [gameId], (result, err) => {
                          if (err) {
                              return;
                          }
                          if (result.affectedRows == 1) {
                              st.query("UPDATE users SET lobby=? WHERE username IN (?,?)", [Date.now(), username, partner], (result, err) => {
                                  if (err) {
                                      res.end('');
                                      return;
                                  }
                                  res.writeHead(200, { 'Content-Type': 'text/plain' });
                                  res.end("ok");
                              });
                          } else if (result.affectedRows == 0) {
                              st.query("UPDATE users SET lobby=0 WHERE username= ?", [username], (result, err) => {
                                  if (err) {
                                      res.end('');
                                      return;
                                  }
                                  res.writeHead(200, { 'Content-Type': 'text/plain' });
                                  res.end("ok");
                              });
                          }
  
                      });
  
                  }
              });
              }
            







              // get_game_id


              


            
          