var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var request = require('request');
var google = require('googleapis');

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
          url: "",
          method: "GET",
          headers: {
              Cookie: "",
              "X-XSRF-TOKEN": ""
          }
      };
    request(options, function(error, response, body){
        if(error){
        console.log(error);
        }
        res.send(body);
    });
  });

// google analytics
var OAuth2Client = google.auth.OAuth2,
    analytics = google.analytics('v3'),
    CLIENT_ID = 'ENTER_CLIENT_ID',
    CLIENT_SECRET = 'CLIENT_SECRET',
    REDIRECT_URL = 'http://localhost:7060/oauthcallback',
    oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// retrieve an access token
function getAccessToken () {
    // generate consent page url
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // will return a refresh token
        scope: 'https://www.googleapis.com/auth/analytics' // can be a space-delimited string or an array of scopes
    });

    console.log('Visit the url: ', url);
}
getAccessToken();

function getNewUsers() {
    analytics.data.ga.get({
        auth: oauth2Client,
        'ids': 'ga:59525543',
        "start-date": "2016-03-02",
        "end-date": "2017-03-02",
        'metrics': 'ga:newUsers',
        'dimensions': 'ga:dimension2',
        'filters':'ga:dimension1==QA'
    }, function (err, data) {
        if (err) {
            return console.log('An error occurred', err);
        }
        console.log(data.totalResults);
    });
}

function getMostAvidUser() {
    analytics.data.ga.get({
        auth: oauth2Client,
        'ids': 'ga:59525543',
        "start-date": "2016-03-02",
        "end-date": "2017-03-02",
        'metrics': 'ga:sessionDuration',
        'dimensions': 'ga:dimension2',
        'filters':'ga:dimension1==QA'
    }, function (err, data) {
        if (err) {
            return console.log('An error occurred', err);
        }
        console.log(data);
    });
}
 
app.get("/oauthcallback", function (req, res) {
    if (req.query) {
        oauth2Client.getToken(req.query.code, function (err, tokens) {
            if (err) {
                return console.log(err);
            }
            // set tokens to the client
            // TODO: tokens should be set by OAuth2 client.
            oauth2Client.setCredentials(tokens);
            getNewUsers();
            getMostAvidUser();
        });
    }
    res.sendFile(__dirname + '/public/index.html');

});

  // application -------------------------------------
  app.get("/home", function(req,res){
    res.sendFile(__dirname + '/public/index.html');
  });

app.listen(7060);
console.log('App listening on port 7060');
