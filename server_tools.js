let fs = require('fs');
let mysql = require('mysql');

exports.serveStaticFile = (filename, res)=>{
    if(filename == "/"){ //if these no spesipic file
        filename = "/index.html"; //refer ot index.html automatic
    }
    // can read a variables of the frame function
    let readStaticFile = (ct, filename)=>{
        fs.readFile("." + filename, (err, data)=>{
            if(err){
                res.writeHead(404, {'Content-Type':'text/plain'});
                res.end("file not found");
                return;
            }
            res.writeHead(200, {'Content-Type':ct});
            return res.end(data); // return a value
        });

    };

    let extToCT = {
        ".html" : "text/html",
        ".css" : "text/css",
        ".js" : "application/javascript",
        ".jpg" : "image/jpeg",
        ".png" : "image/png"
    };

    let indexOfDot = filename.lastIndexOf(".");
    if(indexOfDot == -1){ // checks that the file contain an extension
        res.writeHead(400, {"Content-Type":"text/plain"});
        res.end("invalid file name (no extension).");
        return;
    }
   
    let ext = filename.substring(indexOfDot);
    let ct = extToCT[ext];
    if(!ct){
        res.writeHead(400, {"Content-Type":"text/plain"});
        res.end("invalid file name (unknown extension).");
        return;
    }
    readStaticFile(ct, filename);
};
exports.query = (sql, params, callback)=>{ //database only!
    let conn = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1830dave$",
        database: "blackjack_db"
    });
    conn.connect((err)=>{
        if(err){
            callback(null, err);
            return;
        }
        conn.query(sql, params, (err, result, fields)=>{
            callback(result, err);
        });
        conn.end();
    });
};