//Dependencies
var express = require("express");
var app = express();
var PORT = 8080;

var path = require("path");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.text());
app.use(bodyParser.json({
    type: "application/vnd.api+json"
}));

// static paths for public and data directories 
app.use(express.static('public'));
app.use(express.static('data'));

// use route exports from the htmlRoutes and apiRoutes files
// order matters here because htmlRoutes has a catch-all USE route that sends users to HP if encountered before other routes; it must come last 
app.use(require("./routing/apiRoutes"));
app.use(require("./routing/htmlRoutes"));


// Server start
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});