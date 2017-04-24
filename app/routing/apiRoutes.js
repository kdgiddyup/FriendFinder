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
            // Since Firebase is already returning the JSON representation of the membership, we can almost just ship it back out to the client.
            // However, if we want a link back to the homepage, we are res.send()-ing it, not res.json()-ing it, therefore we HTML-ize it with the pretty-print formatter wrapped in <pre></pre> tags. <-- Hey, thanks, stackoverflow
            res.send('<h2><a href="/">Return home</a></h2>'+'<pre>'+JSON.stringify(members, null, 2)+'</pre>');
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
                // zero out totalDifference for this member
                totalDifference = 0;

                // for this member, loop through the score array
                for (var scoreIndex = 0; scoreIndex < members[i].scores.length; scoreIndex++) {
                    // only compute differences if array values between incoming user and this member are not equal
                    if (members[i].scores[scoreIndex] != incomingScores[scoreIndex]) {
                        // parse array values to integers, get difference and apply Math.abs() to eliminate negative sign, and add to this cycle's totalDifference value
                        totalDifference += Math.abs(parseInt(incomingScores[scoreIndex])-parseInt(members[i].scores[scoreIndex]));                 
                    }
                } // end this member's scores loop
                // push the ID of this member and the totalDifference value to the differenceScores array; we need to include the ID because we'll modify the array to find the closest match
                differenceScores.push({id:i,score:totalDifference});
            } // end membership FOR loop
            // we now have an array of {id,differenceScores} ojects we can sort to find the minimum differenceScore, which is our best match
            var bestMatch = differenceScores.sort(function(a, b){
                return a.score-b.score
            })[0];  // [0] =  first index in the sorted array, which is sorted smallest difference to largest

            // now that we're done messing with existing members, add our new user info to Firebase DB; they're now members, too.
            // a future improvement would be to evaluate member name against existing members and get user input on if they want to overwrite or change name to unique value
            firebase.database().ref("members/"+(members.length)).update( incomingUser ); 
            // notes about above firebase notation: ref("members/") sets path in this Firebase DB project; +(members.length) adds a new key for this member equal to the length of the members object, which is to say it increments up by one 
            
            // finally, respond in JSON with name and image of best match:
            res.json({name: members[bestMatch.id].name,image: members[bestMatch.id].photo});
        }  // end evaluateUser function
});

// make this route object available to server.js
module.exports = apiRouter;