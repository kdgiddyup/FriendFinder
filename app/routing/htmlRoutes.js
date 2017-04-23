var express = require('express')
var path = require("path");

// we'll use the Router() method discussed at https://expressjs.com/en/guide/routing.html to make these routes available to server.js
// this becomes middleware that is specific to this set of routes
var htmlRouter = express.Router()

// define the survey page route
htmlRouter.route("/survey")
    .get(function(req, res) {
        res.sendFile(path.join(__dirname, "../public/survey.html"))
    });
    
// catchall route to get browser back to home.html; it should occur after all other route definitions 
htmlRouter.use(function(req, res){
    res.sendFile(path.join(__dirname, "../public/home.html"))
});

module.exports = htmlRouter;

