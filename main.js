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


http.createServer((req, res) => {
    let q = url.parse(req.url, true);
    let path = q.pathname;
    if (path.startsWith("/api")) {
        path = path.substring(4);
        let username = q.query.username;
        let password = q.query.password;
        if (!username || !password) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("username and password are required");
            return;
        }
        if (path.startsWith("/signup")) {
            st.query("INSERT INTO users(username,password) VALUES (?,?)", [username, password], (result, err) => {
                if (err) {
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end("taken");
                    return;
                }
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("ok");
            });
        } else if (path.startsWith("/login")) {
            validateUser(username, password, (isValid) => {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(isValid ? "ok" : "invalid");
            });












            //get a list of all users that are currently waiting to be picked up by another user.
        } else if (path.startsWith("/get_lobby")) {
            st.query("UPDATE users SET lobby=? WHERE username=? AND NOT lobby=-1", [Date.now(), username], (result, err) => {
                if (err) {
                    //not now

                    return;
                }
                st.query("SELECT username FROM users WHERE ? - lobby < 3000", [Date.now()], (result, err) => {
                    if (err) {
                        //not now

                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                });

            });














            //when the user picks up another user from the lobby to initiate a game.
        } else if (path.startsWith("/start_game")) {
            let partner = q.query.partner;

            if (!partner) {
                return;
            }
            st.query("UPDATE users SET lobby = -1 WHERE username IN (?,?) AND ? - lobby < 3000", [username, partner, Date.now()], (result, err) => {
                if (err) {
                    //not now

                    return;
                }
                if (result.affectedRows == 2) {

                    let body = [];
                    req.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        body = JSON.parse(body);

                        const dealerHand = JSON.stringify(body.dealerHand);
                        const player01Hand = JSON.stringify(body.player01Hand);
                        const player02Hand = JSON.stringify(body.player02Hand);
                        const dealerScore = JSON.stringify(body.dealerScore)
                        st.query("INSERT INTO games(player01,player02, dealer_hand, player01_hand, player02_hand, dealer_score, last_action) VALUES (?,?,?,?,?,?,?)", [username, partner, dealerHand, player01Hand, player02Hand, dealerScore, partner], (result, err) => {
                            if (err) {
                                //not now
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end("error");

                            }


                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify("ok"));

                        });
                    });
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end("error");
                }

            });









        } else if (path.startsWith("/leave_game")) {
            //how to find my partner ??
            //go over all games that I am either player1 or player2.
            //from those games, if I am i.e player1, then player2 is my partner.
            //if I am player2, then my partner is player1.

            st.query("SELECT id,player01,player02 FROM games WHERE (player01=? OR player02=?) AND active=1", [username, username], (result, err) => {
                if (err) {
                    //not now

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


                    st.query("UPDATE games SET active=0 WHERE id=? AND active = 1", [gameId], (result, err) => {
                        if (err) {
                            //not now

                            return;
                        }
                        if (result.affectedRows == 1) {
                            st.query("UPDATE users SET lobby=0 WHERE username IN (?,?)", [username, partner], (result, err) => {
                                if (err) {
                                    //not now

                                    return;
                                }
                                res.writeHead(200, { 'Content-Type': 'text/plain' });
                                res.end("ok");
                            });
                        } else if (result.affectedRows == 0) {
                            st.query("UPDATE users SET lobby=0 WHERE username = ?", [username], (result, err) => {
                                if (err) {
                                    //not now

                                    return;
                                }
                                res.writeHead(200, { 'Content-Type': 'text/plain' });
                                res.end("ok");
                            });
                        }


                    });

                }
            });











        } else if (path.startsWith('/get_game_id')) {
            st.query('SELECT * FROM games WHERE (player01=? OR player02=?) AND active=1', [username, username], (result, err) => {
                if (err) {
                    res.end('');
                    return;
                }
                if (result.length >= 1) {
                    let gameInfo = {
                        id: result[0].id,
                        player: result[0].player01,
                        dealer_hand: result[0].dealer_hand,
                        player01Hand: result[0].player01_hand,
                        partner: result[0].player02,
                        player02Hand: result[0].player02_hand,
                        dealerScore: result[0].dealer_score

                    };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(gameInfo));

                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end("-1");
                }
            });









        } else if (path.startsWith('/update_hands')) {
            let gameId = q.query.id;
            if (!gameId) {
                return;
            }
            try {
                // Parse the request body
                let body = [];
                req.on('data', chunk => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    body = JSON.parse(body);

                    const player01Hand = JSON.stringify(body.player01Hand);
                    const player02Hand = JSON.stringify(body.player02Hand);

                    // Second query for only 2 players
                    st.query(`UPDATE games SET player01_hand='${player01Hand}', player02_hand='${player02Hand}',last_action='${username}' WHERE id = ${gameId}`, (result, err) => {
                        if (err) {
                            // res.end("");

                            return;
                        }

                        if (result.length == 1) {
                            let gameStatus = {
                                id: gameId,
                                player01: result[0].player01,
                                player02: result[0].player02,
                                active: result[0].active[0] == 1,
                                dealer_hand: result[0].dealer_hand,
                                player01_hand: result[0].player01_hand,
                                player02_hand: result[0].player02_hand
                            };
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(gameStatus));
                        }
                    });
                    // }  
                });
            } catch (error) {
                console.error("Error processing API request: ", error);
                return;
                // res.writeHead(500, { 'Content-Type': 'application/json' });
                // res.end(JSON.stringify({ error: "server error" }));
            }
        }







        else if (path.startsWith("/update_winner")) {
            let gameId = q.query.id;
            if (!gameId) {
                return;
            }
            try {
                // Parse the request body
                let body = [];
                req.on('data', chunk => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    body = JSON.parse(body);
                    const winner = JSON.stringify(body.winner);
                    // Second query for only 2 players
                    st.query(`UPDATE games SET winner='${winner}' WHERE id = ${gameId}`, (result, err) => {
                        if (err) {
                            return;
                        }

                        if (result.length == 1) {

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end('Sueccess!');
                        }
                    });
                    // }  
                });
            } catch (error) {
                console.error("Error processing API request: ", error);
                return;
                // res.writeHead(500, { 'Content-Type': 'application/json' });
                // res.end(JSON.stringify({ error: "server error" }));
            }

        }
        else if (path.startsWith("/game_check")) {
            let gameId = q.query.id;
            if (!gameId) {
                return;
            }
            try {
                st.query('SELECT * FROM games WHERE id=?', [gameId], (result, err) => {
                    if (err) {
                        return;
                    }
                    if (result.length > 0) {
                        const gameStatus = {
                            player01: result[0].player01,
                            player02: result[0].player02,
                            active: result[0].active[0] == '01',
                            dealer_hand: result[0].dealer_hand,
                            player01_hand: result[0].player01_hand,
                            player02_hand: result[0].player02_hand,
                            winner: result[0].winner,
                            dealerScore: result[0].dealer_score,
                            last_action: result[0].last_action
                        };
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(gameStatus));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end('check');
                    }

                });

            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(err);
            }

        }


    } else {//server static files
        st.serveStaticFile(path, res);
    }

}).listen(8080, () => {
    console.log('Server listening on port 8080');
});

