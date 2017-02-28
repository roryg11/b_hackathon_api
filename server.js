var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var request = require('request');

// configuration
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());


// routes =================================

  app.get("/api/datasummary", function(req, res){
    request("http://localhost:8080/rest/a/enhanced_account/datasummary/basic", function (error, response, body) {
        if(error){
          console.log(error);
        }
        if (!error && response.statusCode == 200) {
            console.log(body);
         }
    });
  });

  // application -------------------------------------
  app.get("*", function(req,res){
    res.sendFile('./public/index.html');
  });

app.listen(7060);
console.log('App listening on port 7060');
