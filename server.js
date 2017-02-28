var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var request = require('request');

// configuration

mongoose.connect('mongodb://roryg11:A2l0f1i!e@olympia.modulusmongo.net:27017/vymY8ros');

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());

// define model

var Todo = mongoose.model('Todo', {
  text: String
});

// routes =================================
  // api ----------------------------------
  // get all todos
  app.get('/api/todos', function(req, res){
    Todo.find(function(err, todos){
      if(err){
        res.send(err);
      } else {
        res.json(todos);
      }
    })
  });

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
