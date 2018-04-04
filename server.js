var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var Player = require('./models/player.js');
//var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/redditScraper");


request("https://www.futhead.com/18/players/", function(error, response, html) {

    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var result = [];

    // Now, grab every everything with a class of "inner" with each "article" tag
    $('a.display-block').each(function(i, element) {

        // Create an empty result object
        var playerStat = {};

        playerStat.rating = $(this).children('.player-rating').children('span').text().trim();

        playerStat.Name = $(this).children('.player-info').children('.player-name').text().trim();

        if (playerStat.Name === '') {

        } else{
            console.log(playerStat);
            Player.create(playerStat).then(function(userdb) {
                result.push(Player);
            }).catch(function(err){
                return err;
            })}

    });
    console.log(result);



});




// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});