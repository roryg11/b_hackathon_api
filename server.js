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

// setup random long list

var length = 0;
lotsOfData = [];

for (var j = 1; j <= length; j++) {
    var newRecord = {
        id: j,
        displayInfo: {
            name: "First Name " + j
        },
        userPermissions: {
            owner: {firstName: "Name" + j, lastName: "LastName" + j}
        },
        cost:  500000 - j,
        inStock: 10 + j,
        dateAdded: new Date ()
    };
    lotsOfData.push(newRecord);
}


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

            var newBody = JSON.parse(body);
            for(var i=0; i < newBody.length; i++){
                newBody[i].cost = 10 + i;
                newBody[i].inStock = 400 - i;
                newBody[i].dateAdded = new Date(parseInt(newBody[i].dateAdded));
            }
            console.log(newBody[1].cost);
            console.log(newBody[1].inStock);
            newBody = newBody.concat(lotsOfData);
            console.log(newBody.length);
            res.send(newBody);
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
        res.send(body);
    });
});

app.get("/googleAnalytics", function (req, res) {
    var newUsers, usageData, mostPopularDayOfWeek;

    getNewUsers(function (err, data) {
        getMostPopularDayOfWeek(function (err, data) {
            getUsageStats(function (err, data) {
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

               usageData = {
                    topUsers: nonSupportUsers,
                    totalHoursSpent: totalHoursSpent
                };

                return res.send({
                    newUsers: newUsers,
                    mostAvidUsers: usageData.topUsers,
                    totalHoursSpent: usageData.totalHoursSpent,
                    mostPopularDayOfWeek: mostPopularDayOfWeek
                });
            });
            if (err) {
                return console.log('An error occurred', err);
            }
            var usageDates = data.rows;
            var dayTallies = [
                {day: "Monday", time: 0},
                {day: "Tuesday", time: 0},
                {day: "Wednesday", time: 0},
                {day: "Thursday", time: 0},
                {day: "Friday", time: 0},
                {day: "Saturday", time: 0},
                {day: "Sunday", time: 0}
            ];
            for (var i = 0; i < usageDates.length; i++ ) {
                var day = moment(usageDates[i][0], "YYYYMMDD").format('dddd');
                for (var j = 0; j < dayTallies.length; j++ ) {
                    if (dayTallies[j].day === day) {
                        dayTallies[j].time += parseInt(usageDates[i][1]);
                    }
                }

            }
            dayTallies.sort(function (a, b) {
                return  b.time - a.time;
            });
            mostPopularDayOfWeek = dayTallies;
        });
        if (err) {
            return console.log('An error occurred', err);
        }
        return  newUsers = data.totalResults;
    });

});

// google analytics ==============================================
var OAuth2Client = google.auth.OAuth2,
    analytics = google.analytics('v3'),
    CLIENT_ID = readProperties["CLIENT_ID"],
    CLIENT_SECRET = readProperties["CLIENT_SECRET"],
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

// GA calls
function getNewUsers(callback) {
    analytics.data.ga.get({
        auth: oauth2Client,
        'ids': 'ga:59525543',
        "start-date": "2016-03-02",
        "end-date": "2017-03-02",
        'metrics': 'ga:newUsers',
        'dimensions': 'ga:dimension2',
        'filters':'ga:dimension1==QA'
    }, callback);
}

function getMostPopularDayOfWeek(callback) {
    analytics.data.ga.get({
        auth: oauth2Client,
        'ids': 'ga:59525543',
        "start-date": "2016-03-02",
        "end-date": "2017-03-02",
        'metrics': 'ga:sessionDuration',
        'dimensions': 'ga:date',
            'filters':'ga:dimension1==QA'
    }, callback);
}

function getUsageStats(callback) {
    analytics.data.ga.get({
        auth: oauth2Client,
        'ids': 'ga:59525543',
        "start-date": "2016-03-02",
        "end-date": "2017-03-02",
        'metrics': 'ga:sessionDuration',
        'dimensions': 'ga:dimension2',
        'filters':'ga:dimension1==QA'
    }, callback);
}
 
//called after successfully authenticating
app.get("/oauthcallback", function (req, res) {
    if (req.query) {
        oauth2Client.getToken(req.query.code, function (err, tokens) {
            if (err) {
                return console.log(err);
            }
            // set tokens to the client
            // TODO: tokens should be set by OAuth2 client.
            oauth2Client.setCredentials(tokens);
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
