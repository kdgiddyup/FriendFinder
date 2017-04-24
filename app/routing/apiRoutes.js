// Dependencies
var express = require('express')
var path = require("path");

// firebase integration
// *****************************
var firebase = require("firebase");
// Initialize public Firebase
var config = {
apiKey: "AIzaSyB3_mhY_yIAodzxzVTAAofGmboW92aMOmU",
authDomain: "friendfinder-6a01e.firebaseapp.com",
databaseURL: "https://friendfinder-6a01e.firebaseio.com",
projectId: "friendfinder-6a01e",
storageBucket: "friendfinder-6a01e.appspot.com",
messagingSenderId: "70875142657"
};
firebase.initializeApp(config);

// Create a variable to reference the database
database=firebase.database();

// we'll use the Router() method discussed at https://expressjs.com/en/guide/routing.html to make these routes available to server.js
var apiRouter = express.Router()

// for any route (here, "/api/friends") we can chain HTTP methods: a GET to display JSON of all friends, and a POST to:
    // receive JSON survey results, 
    // store it in a DB, 
    // run compatibility logic and 
    // return JSON results 
apiRouter.route("/api/friends")
    .get(function(req, res) { 
        // this is an API route that returns JSON of all friends
        // get a one-time snapshot of the current FriendFinder membership from Firebase db and run returnJSON as the callback
        database.ref().once("value", returnJSON, function(errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        function returnJSON(snapshot) {
            var members = snapshot.val().members;
            // since Firebase is already returning the JSON representation of the membership, we can just ship it back out to the client
            res.json(members);
            }
        })
    .post(function(req, res) {
        var incomingUser = req.body;
        var incomingScores = incomingUser.scores;
         // get a one-time snapshot of the current FriendFinder membership from Firebase db and run evaluateUser as the callback
        database.ref().once("value", evaluateUser, function(errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        function evaluateUser(snapshot) {
            var members = snapshot.val().members;
            // compute scores:
            // array [differenceScore] will hold the totalDifference score between our submitter and each member
            var differenceScores = [];
            var totalDifference = 0;
            // loop through entire current membership
            for (var i = 0; i< members.length; i++){
                // for each member, loop through this member's score array
                // zero out totalDifference
                totalDifference = 0;
                for (var scoreIndex = 0; scoreIndex < members[i].scores.length; scoreIndex++) {
                    // only parse to integers and compute differences if array values are not equal
                    if (members[i].scores[scoreIndex] != incomingScores[scoreIndex]) {
                        // parse array values to integers, get difference and apply Math.abs() to eliminate negative sign, and add to this cycle's totalDifference value
                        totalDifference += Math.abs(parseInt(incomingScores[scoreIndex])-parseInt(members[i].scores[scoreIndex]));                 }
                } // end this member's scores loop
                // push the ID of this member and the difference value to the differenceScores array
                differenceScores.push({id:i,score:totalDifference});
            } // end membership for loop
            // sort the array of all scores to find the minimum
            var bestMatch = differenceScores.sort(function(a, b){
                return a.score-b.score
            })[0];

            // add user info to Firebase DB; they're now members, too.
            firebase.database().ref("members/"+(members.length)).update( incomingUser );
            
            // finally, respond in JSON with name and image of best match:
            res.json({name: members[bestMatch.id].name,image: members[bestMatch.id].photo});
        }  // end evaluateUser function
});

module.exports = apiRouter;