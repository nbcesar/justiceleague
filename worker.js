#!/usr/bin/env node

// init project
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var firebase = require("firebase");
var HTTPS = require('https');

var app = express();

var botID = 'e7d871c51ec5ef498afd823d88';

firebase.initializeApp({
  serviceAccount: "pickemserver.json",
  databaseURL: "https://pickem-football.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("/justiceleague");

//console.log("I am doing my 10 minutes check");

app.post('/', function(req, res) {
  console.log('testing');
  var request = JSON.parse(req.chunks[0]);
  console.log(request.text);
});

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

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
