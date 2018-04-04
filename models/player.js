// Include the momentJS library
var moment = require("moment");

// Require Mongoose
var mongoose = require('mongoose');

// Create a Schema Class
var Schema = mongoose.Schema;

// Create Article Schema
var PlayerSchema = new Schema({

  // Player Name
  Name: {
    type: String,
    required: true
  },

  // Rating
  rating: {
    type: String,
    required: true
  },
  
  // Link to Player
  Link: {
    type: String,
    required: true
  },

  // Date of article scrape (saving as a string to pretify it in Moment-JS)
  updated: {
    type: String,
    default: moment().format('MMMM Do YYYY, h:mm A')
  },

  // Create a relation with the Comment model
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]

});

// Create the Player model with Mongoose
var Player = mongoose.model('Player', PlayerSchema);

// Export the Model
module.exports = Player;