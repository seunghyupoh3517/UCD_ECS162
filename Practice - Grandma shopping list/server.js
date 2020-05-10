// server.js - node app starts

const express = require("express");
const app = express();

let gList = {"tomatoes", "tea"};

function handleShoppingList(request, response, next){
	if (typeof(gList) === "object"){
		response.json(gList);
		// long version:  expands response.json
        // response.status(200);
        // response.send(JSON.stringify(gList));
	}
	else{
		next();
	}
}

app.use(express.static("public"));

app.get("/", function (request, response){
	response.sendFile(__dirname + "index.html");
});

app.get("shoppingList", handleShoppingList);

app.all("*", function(request, response){
	response.status(404); // status code: not found
	response.send("This is not the droid you are looking for"); });

const Listener = app.listen(process.env.PORT, function(){
	console.log("Your app is listeneing on port " + listener.address().port);
});