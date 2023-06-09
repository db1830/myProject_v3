
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
          
          lblGameId.innerHTML = 'Your game id is: ' + res.id;
          playerOne.innerHTML= "player01: " + res.player01;
          playerTwo.innerHTML= "player02: " + res.player02;
          show(divGame);
        }
      });
    }
  });
}

  


              


            
          