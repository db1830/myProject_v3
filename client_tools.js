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


function sendHttpPostRequest(body, callback){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = ()=>{
        if(httpRequest.readyState == 4){
             if(httpRequest.status == 200){
                 callback(httpRequest.responseText);
             }   
        } 
     };
     httpRequest.open("POST", 'api/get_game_status?username='+username+'&password='+password+'&id='+gameId , true);
     httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
     return httpRequest.send(JSON.stringify(body));
     
}