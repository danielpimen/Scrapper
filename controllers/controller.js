// Node Dependencies
var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request'); // for web-scraping
var cheerio = require('cheerio'); // for web-scraping

// Import the Comment and Article models
var Player = require('../models/player.js');

// Index Page Render (first visit to the site)

///////////////////////////////////////////////////////////////////////////////////////
router.get('/players', function (req, res){

  // Query MongoDB for all article entries (sort newest to top, assuming Ids increment)
  Player.find().sort({_id: 1})

    // But also populate all of the comments associated with the articles.
   // .populate('comments')

    // Then, send them to the handlebars template to be rendered
    .exec(function(err, doc){
      // log any errors
      if (err){
        console.log(err);
      } 
      // or send the doc to the browser as a json object
      else {
        var hbsObject = {players: doc}
        res.render('index', hbsObject);
       console.log(hbsObject)
      }
    });

});



////////////////////////////////////////////////////////////////////////////////////////


router.get('/scrape', function(req, res) {

  // First, grab the body of the html with request
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
            //console.log(playerStat);
            Player.create(playerStat).then(function(userdb) {
                result.push(Player);
            }).catch(function(err){
                return err;
            })}

    });
    console.log(result);



});


});

// Export Router to Server.js
module.exports = router;
