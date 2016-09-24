// server.js
// where your node app starts

// init project
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var firebase = require("firebase");
var HTTPS = require('https');
var bodyParser = require('body-parser');

var botID = 'e7d871c51ec5ef498afd823d88';
var monkeyBot = '68e5a5a031b76f572c1ca90224';

getScores();

firebase.initializeApp({
  serviceAccount: "pickemserver.json",
  databaseURL: "https://pickem-football.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("/justiceleague");
var monkeyRef = db.ref("/ironmonkey");

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  //response.sendFile(__dirname + '/views/index.html');
});

app.post('/', function(req, res) {
  if (req.body.text == '/scores') {    
    //var botResponse;
    //botResponse = getScores();
    if (req.body.name === 'weTalkinAuction') {
      botResponse = "I am sorry master...I haven't exactly figured out how to get the scores but I am working on it...All hail Santo Dominates.";  
    }
    else {
      botResponse = "FU " + req.body.name + ". I take orders from no one.";
    }
    var options, body, botReq;    
    options = {
      hostname: 'api.groupme.com',
      path: '/v3/bots/post',
      method: 'POST'
    };
    body = {
      "bot_id" : botID,
      "text" : botResponse
    };
    //console.log('sending ' + botResponse + ' to ' + botID);
    botReq = HTTPS.request(options, function(res) {
        if(res.statusCode == 202) {
          //neat
          console.log('sent');
        } else {
          console.log('rejecting bad status code ' + res.statusCode);
        }
    });
    botReq.on('error', function(err) {
      console.log('error posting message '  + JSON.stringify(err));
    });
    botReq.on('timeout', function(err) {
      console.log('timeout posting message '  + JSON.stringify(err));
    });
    botReq.end(JSON.stringify(body));
  }
  
  
});


// Scrape ESPN league every 30 minutes
var minutes = 30, the_interval = minutes * 60 * 1000;
setInterval(function() {
  //console.log("I am doing my 30 minutes check");
  // Scrape here
  url = 'http://games.espn.com/ffl/leagueoffice?leagueId=560005&seasonId=2016';
  
  request(url, function(error, response, html) {
    
    if(!error) {
      
      var $ = cheerio.load(html);
  
      $('.lo-recent-activity-item').each(function(i, el) {
  
        var itemTime = $(this).children().children('.recent-activity-when').text();
        var itemDesc = $(this).children().children('.recent-activity-description').text();
        
        ref.child(itemTime).once('value', function(data) {
          if (data.val() === null) {
            ref.child(itemTime).set(itemDesc);
            
            // send message
            
            var botResponse, options, body, botReq;

            botResponse = itemDesc;
          
            options = {
              hostname: 'api.groupme.com',
              path: '/v3/bots/post',
              method: 'POST'
            };
          
            body = {
              "bot_id" : botID,
              "text" : botResponse
            };
          
            console.log('sending ' + botResponse + ' to ' + botID);
          
            botReq = HTTPS.request(options, function(res) {
                if(res.statusCode == 202) {
                  //neat
                  console.log('sent');
                } else {
                  console.log('rejecting bad status code ' + res.statusCode);
                }
            });
          
            botReq.on('error', function(err) {
              console.log('error posting message '  + JSON.stringify(err));
            });
            botReq.on('timeout', function(err) {
              console.log('timeout posting message '  + JSON.stringify(err));
            });
            botReq.end(JSON.stringify(body));
          }
        });
        
      });
    }
    else {
      console.log(error);
    }
  });
}, the_interval);


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

function getScores() {
  url = "http://games.espn.com/ffl/scoreboard?leagueId=560005&seasonId=2016";
  
  request(url, function(error, response, html) {
    var $ = cheerio.load(html);
    
    $('.ptsBased').each(function(i, el) {
      var name1 = $(this).children().children().text();
      console.log(name1);
    });
    
  });
  
}