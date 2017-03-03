var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var request = require('request');
var google = require('googleapis');
var moment = require('moment');
var readProperties = require('./services/readPropertiesService.js')();

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
              Cookie: readProperties["com.beckon.jSessionId"],
              "X-XSRF-TOKEN": readProperties["com.beckon.xsrfToken"]
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
                Cookie: readProperties["com.beckon.jSessionId"],
                "X-XSRF-TOKEN": readProperties["com.beckon.xsrfToken"],
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
            Cookie: readProperties["com.beckon.jSessionId"],
            "X-XSRF-TOKEN": readProperties["com.beckon.xsrfToken"],
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

// google analytics
var OAuth2Client = google.auth.OAuth2,
    analytics = google.analytics('v3'),
    CLIENT_ID = '712427025585-b5iuvur0ghitm6q8l4iis5ifmcluhfg9.apps.googleusercontent.com',
    CLIENT_SECRET = 'uc-E5KkpQS1drbe4z1_rHjsH',
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
        console.log("Total users:" + data.totalResults);
    });
}

function getMostPopularDayOfWeek() {
    analytics.data.ga.get({
        auth: oauth2Client,
        'ids': 'ga:59525543',
        "start-date": "2016-03-02",
        "end-date": "2017-03-02",
        'metrics': 'ga:sessionDuration',
        'dimensions': 'ga:date',
            'filters':'ga:dimension1==QA'
    }, function (err, data) {
        if (err) {
            return console.log('An error occurred', err);
        }
        var usageDates = data.rows;
        var dayTallies = {
            "Monday": 0,
            "Tuesday": 0,
            "Wednesday": 0,
            "Thursday": 0,
            "Friday": 0,
            "Saturday": 0,
            "Sunday": 0
        };
        for (var i = 0; i < usageDates.length; i++ ) {
             var day = moment(usageDates[i][0], "YYYYMMDD").format('dddd');
            dayTallies[day] += parseInt(usageDates[i][1]);
        }
        console.log("Tallied dayes: " + dayTallies);

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

        var usersWithUsage = data.rows,
            totalHoursSpent = data.totalsForAllResults["ga:sessionDuration"];
        usersWithUsage.sort(function (a, b) {
            return  b[1] - a[1];
        });

        var nonSupportUsers = usersWithUsage.filter( function (user) {
            return user[0] !==  "app-support@beckon.com";
        });

        var top5Users = nonSupportUsers.slice(0, 5);

        console.log({topUsers: top5Users,
            totalHoursSpent: totalHoursSpent});
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
            getMostPopularDayOfWeek();
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
