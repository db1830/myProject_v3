const http = require('http');
const url = require('url');
const st = require('./server_tools');



function validateUser(username, password, callback) {
    st.query("SELECT COUNT(*) AS count FROM users WHERE username=? AND BINARY password=?", 
    [username, password], (result, err) => {
        if (err) {
            callback(false);
            return;
        }
        callback(result[0].count == 1);
    });
}


http.createServer((req,res)=>{
    let q = url.parse(req.url, true);
    let path = q.pathname;
    if(path.startsWith("/api")){
        path = path.substring(4);
        let username = q.query.username;
        let password = q.query.password;
        if(!username || !password){
            res.writeHead(400, {"Content-Type":"text/plain"});
            res.end("username and password are required");
            return;
        }
        if(path.startsWith("/signup")){
            st.query("INSERT INTO users(username,password) VALUES (?,?)",[username, password], (result, err)=>{
                if(err){
                    res.writeHead(200, {"Content-Type":"text/plain"});
                    res.end("taken");
                    return;
                }
                res.writeHead(200, {"Content-Type":"text/plain"});
                res.end("ok");
            });
        }else if(path.startsWith("/login")){
            validateUser(username, password, (isValid)=>{
                res.writeHead(200, {"Content-Type":"text/plain"});
                res.end(isValid ? "ok" : "invalid");
            });

        }
        
        
        
        
        
        
        
        
        
        
        
        else if(path.startsWith("/get_lobby")){//get a list of all users that are currently waiting to be picked up by another user.
            st.query("UPDATE users SET lobby=? WHERE username=? AND NOT lobby=-1", [Date.now(),username], (result,err)=>{
                if(err){
                    //not now

                    return;
                }
                st.query("SELECT username FROM users WHERE (? - lobby) < 3000",[Date.now()], (result, err)=>{
                    if(err){
                        //not now
    
                        return;
                    }
                    res.writeHead(200, {'Content-Type':'application/json'});
                    res.end(JSON.stringify(result));
                });

            });
        }
        
        
        
        
        
        
        
        
        
        //when the user picks up another user from the lobby to initiate a game.
        else if(path.startsWith("/start_game")){
            let partner = q.query.partner;
            if(!partner){
                console.log("!not")
                return;
            }
            st.query("UPDATE users SET lobby = -1 WHERE username IN (?,?) AND (? - lobby) < 3000",[username, partner,Date.now()], (result, err)=>{
                if(err){
                    //not now
        
                    return;
                }
                if(result.affectedRows == 2){
                    st.query("INSERT INTO games(player01,player02) VALUES (?,?)", [username, partner], (result, err)=>{
                        console.log("result2", result,err)

                        if(err){
                            //not now
                            res.writeHead(500, {'Content-Type':'text/plain'});
                            res.end("error:" + err.toString());
                            
                        }

                            res.writeHead(200, {'Content-Type':'text/plain'});
                            res.end("ok");
                            
                    });
                }else{
                    res.writeHead(200, {'Content-Type':'text/plain'});
                    res.end("error");
                }
        
            });

        }
        
        
        
        
        
        
        
        
        
        
        
        
        else if(path.startsWith("/leave_game")){
            //how to find my partner ??
            //go over all games that I am either player1 or player2.
            //from those games, if I am i.e player1, then player2 is my partner.
            //if I am player2, then my partner is player1.
            st.query("SELECT id,player01,player02 FROM games WHERE (player01=? OR player02=?) AND active=1",[username, username], (result, err)=>{
                if(err){
                    //not now

                    return;
                }
                if(result.length >= 1){
                    let gameId = result[0].id;
                    let partner;
                    if(result[0].player01 == username){
                        partner = result[0].player02;
                    }else{
                        partner = result[0].player01;
                    }

                    
                    st.query("UPDATE games SET active=0 WHERE id=? AND active=1",[gameId],(result,err)=>{
                        if(err){
                            //not now
        
                            return;
                        }
                        if(result.affectedRows == 1){
                            st.query("UPDATE users SET lobby=0 WHERE username IN (?,?)",[username, partner], (result,err)=>{
                                if(err){
                                    //not now
                
                                    return;
                                }
                                res.writeHead(200, {'Content-Type':'text/plain'});
                                res.end("ok");
                            });
                        }else if(result.affectedRows == 0){
                            st.query("UPDATE users SET lobby=0 WHERE username = ?",[username], (result,err)=>{
                                if(err){
                                    //not now
                
                                    return;
                                }
                                res.writeHead(200, {'Content-Type':'text/plain'});
                                res.end("ok");
                            });
                        }
                        

                    });
                    
                }
            });
            
        }
        
        
        
        
        
        
        
        
        
        else if(path.startsWith('/get_game_id')){
                st.query('SELECT id, player01, player02 FROM games WHERE (player01=? OR player02=?) AND active=1', [username, username], (result,err)=>{
                    if(err){
                        res.end('');
                        return;
                    }
                    if(result.length >= 1){
                    //    let gameId = result[0].id;
                       let gameInfo = {
                        id: result[0].id,
                        player01: result[0].player01,
                        player02: result[0].player02,
                    };
                       res.writeHead(200, { 'Content-Type': 'application/json' });
                       res.end(JSON.stringify(gameInfo));
                    }else{
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end("-1");
                    }
                });
            }
            
            
            
            
            
            
            
            
            
            
            
            else if(path.startsWith('/get_game_status')){
                let gameId = q.query.id;
                if(!gameId) return;
                    // Parse the request body
                    let body = [];
                    req.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        let gameState = JSON.parse(body);
                        // Store the game state in the database

                        st.query('UPDATE games SET game_state=? WHERE id=? AND (player01=? OR player02=?)', [JSON.stringify(gameState), gameId, username, username], (result, err) => {
                            if (err) {
                                res.end("");
                                return;
                            }
                            
                            // Return the updated game status
                            st.query('SELECT player01, player02, active, game_state FROM games WHERE id=? AND (player01=? OR player02=?)', [gameId, username, username], (result, err) => {
                                if (err) {
                                    res.end("");
                                    return;
                                }
                                if (result.length == 1) {
                                    let gameStatus = {
                                        id: gameId,
                                        player01: result[0].player01,
                                        player02: result[0].player02,
                                        active: result[0].active[0] == 1,
                                    };
                                    
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify(gameStatus));
                                }
                            });
                        });
                    }); 
            }










            
            /*else if (path.startsWith("/player_action")) {
                let action = q.query.action;
                let gameId = q.query.game_id;
                if (!action || !gameId) {
                    res.writeHead(400, {"Content-Type": "text/plain"});
                    res.end("Invalid action or game ID");
                    return;
                }
            
                // Query the game state from the database
                st.query("SELECT * FROM games WHERE id=?", [gameId], (result, err) => {
                    if (err || result.length == 0) {
                        res.writeHead(400, {"Content-Type": "text/plain"});
                        res.end("Invalid game ID");
                        return;
                    }
            
                });
            }*/
    } else {//server static files
        st.serveStaticFile(path, res);
    }

}).listen(8080, () => {
    console.log('Server listening on port 8080');
});

