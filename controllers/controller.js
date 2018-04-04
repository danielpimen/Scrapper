// Node Dependencies
var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request'); // for web-scraping
var cheerio = require('cheerio'); // for web-scraping

// Import the Comment and Article models
var Player = require('../models/player.js');

// Index Page Render (first visit to the site)
router.get('/', function (req, res){

  // Scrape data
  res.redirect('/scrape');

});

router.get('/scrape', function(req, res) {

  // First, grab the body of the html with request
  request('https://www.futhead.com/18/players/', function(error, response, html) {

    // Then, load html into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // This is an error handler for the Onion website only, they have duplicate articles for some reason...
    var playerArray = [];

    // Now, grab every everything with a class of "inner" with each "article" tag
    $('a.display-block').each(function(i, element) {

        // Create an empty result object
        var result = {};

        // Collect the Article Title (contained in the "h2" of the "header" of "this")
        result.rating = $(this).children('.player-rating').children('font-12').text().trim() + ""; //convert to string for error handling later

        // Collect the Article Link (contained within the "a" tag of the "h2" in the "header" of "this")
        result.player = $(this).children('.player-info').children('.player-name').text().trim();

        // Collect the Article Summary (contained in the next "div" inside of "this")
       // result.summary = $(this).children('div').text().trim() + ""; //convert to string for error handling later
      

        // Error handling to ensure there are no empty scrapes
        if(result.rating !== "" &&  result.player !== ""){

          // BUT we must also check within each scrape since the Onion has duplicate articles...
          // Due to async, moongoose will save the articles fast enough for the duplicates within a scrape to be caught
          if(playerArray.indexOf(result.player) == -1){

            // Push the saved item to our titlesArray to prevent duplicates thanks the the pesky Onion...
            playerArray.push(result.rating);

            // Only add the entry to the database if is not already there
            Player.count({ name: result.player}, function (err, test){

              // If the count is 0, then the entry is unique and should be saved
              if(test == 0){

                // Using the Article model, create a new entry (note that the "result" object has the exact same key-value pairs of the model)
                var entry = new Player (result);

                // Save the entry to MongoDB
                entry.save(function(err, doc) {
                  // log any errors
                  if (err) {
                    console.log(err);
                  } 
                  // or log the doc that was saved to the DB
                  else {
                    console.log(doc);
                  }
                });

              }
              // Log that scrape is working, just the content was already in the Database
              else{
                console.log('Redundant Database Content. Not saved to DB.')
              }

            });
        }
        // Log that scrape is working, just the content was missing parts
        else{
          console.log('Redundant Onion Content. Not Saved to DB.')
        }

      }
      // Log that scrape is working, just the content was missing parts
      else{
        console.log('Empty Content. Not Saved to DB.')
      }

    });

    // Redirect to the Articles Page, done at the end of the request for proper scoping
    //res.redirect("/articles");

  });

});
