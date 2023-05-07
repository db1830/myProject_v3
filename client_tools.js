function sendHttpGetRequest(url, callback){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = ()=>{
        if(httpRequest.readyState == 4){
             if(httpRequest.status == 200){
                 callback(httpRequest.responseText);
             }   
        } 
     };
     httpRequest.open("GET", url, true);
     httpRequest.send();
}

// the function taking care of http request from type "GET"
// the server answer only in status '200'(ok),
// and 'send()' passes the 'GET' type request


function updateHandsPostRequest(body,gameId, callback){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = ()=>{
        if(httpRequest.readyState == 4){
             if(httpRequest.status == 200){
                 callback(httpRequest.responseText);
             }   
        } 
     };
     httpRequest.open("POST", 'api/update_hands?username='+username+'&password='+password+'&id='+gameId , true);
     httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
     httpRequest.send(JSON.stringify(body));
     
}

function updateWinnerRequest(gameInfo, callback){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = ()=>{
        if(httpRequest.readyState == 4){
             if(httpRequest.status == 200){
                 callback(httpRequest.responseText);
             }   
        } 
     };
     httpRequest.open("POST", 'api/update_winner?username='+username+'&password='+password+'&id='+gameInfo.gameId , true);
     httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
     httpRequest.send(JSON.stringify(gameInfo));
     
}

function startGamePostRequest(body,username,partner, callback){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = ()=>{
        if(httpRequest.readyState == 4){
             if(httpRequest.status == 200){
                 callback(httpRequest.responseText);
             }   
        } 
     };
     httpRequest.open("POST", 'api/start_game?username='+username+'&password='+password+'&partner='+partner , true);
     httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
     httpRequest.send(JSON.stringify(body));
     
}