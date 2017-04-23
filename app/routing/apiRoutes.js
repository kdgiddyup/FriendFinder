var express = require('express')
var path = require("path");

// we'll use the Router() method discussed at https://expressjs.com/en/guide/routing.html to make these routes available to server.js
var apiRouter = express.Router()

// for any route (here, "/api/friends") we can chain HTTP methods: a GET to display JSON of all friends, and a POST to:
    // receive JSON survey results, 
    // store it in a DB, 
    // run compatibility logic and 
    // return JSON results 
apiRouter.route("/api/friends")
    .get(function(req, res) { 
        console.log('friends JSON return');
        return /* res.json( friends JSON goes here ) */;
        })
    .post(function(req, res) {
        console.log('processing survey results and running compatibility check');
        console.log(req);
});

module.exports = apiRouter;