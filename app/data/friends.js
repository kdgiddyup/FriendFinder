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

// initialize population variable, which holds survey responses; this will be populated from Firebase on page load
var population = [];

 // At the initial load, get a snapshot of the current data.
database.ref().on("value", function(snapshot) {
	var remote = snapshot.val();
	console.log(remote);

    // any data there?
    if (remote.child("population").exists()) {
		// store it in local population variable
        population = remote.population
        }
    
    },
    // If any errors are experienced, log them to console.
	function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    }
);


