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

  app.get("/api/getSummary", function(req, res){
      var options = {
          url: "https://app.beckon.com/rest/a/QA/datasummary/basic",
          method: "GET",
          headers: {
              Cookie: "JSESSIONID=10_10_102_22_7k6bzw45dy2xru84py20dsi4.10_10_103_104_",
              "X-XSRF-TOKEN": "5376257b22be41c70578007daf6522da7126f20a"
          }
      };
    request(options, function(error, response, body){
        if(error){
        console.log(error);
        }
        res.send(body);
    });
  });

    app.get("/api/dashboards", function(req, res){
        var options = {
            url: "https://app.beckon.com/rest/a/QA/dashboard/list",
            method: "GET",
            headers: {
                Cookie: "JSESSIONID=10_10_102_22_7k6bzw45dy2xru84py20dsi4.10_10_103_104_",
                "X-XSRF-TOKEN": "5376257b22be41c70578007daf6522da7126f20a",
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            }
        };
        request(options, function(error, response, body){
            if(error){
                console.log(error);
            }
            console.log(response);
            res.send(body);
        });
    });

app.get("/api/scorecards", function(req, res){
    var options = {
        url: "https://app.beckon.com/rest/a/QA/scorecards",
        method: "GET",
        headers: {
            Cookie: "JSESSIONID=10_10_102_22_7k6bzw45dy2xru84py20dsi4.10_10_103_104_",
            "X-XSRF-TOKEN": "5376257b22be41c70578007daf6522da7126f20a",
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*"
        }
    };
    request(options, function(error, response, body){
        if(error){
            console.log(error);
        }
        console.log(response);
        res.send(body);
    });
});

  // application -------------------------------------
  app.get("/home", function(req,res){
    res.sendFile(__dirname + '/public/index.html');
  });

app.listen(7060);
console.log('App listening on port 7060');
