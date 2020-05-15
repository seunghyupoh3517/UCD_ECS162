// This code runs as soon as the page is loaded, when
// the script tag in the HTML file is executed.

// It sends a GET request for the JSON file postcardData.json

//===========================================================
// get the query string value -> 
// https://davidwalsh.name/query-string-javascript
//function getQueryVariable(variable) {
//	var query = window.location.search.substring(1);
//	var vars = query.split("&");
//	for (var i=0;i<vars.length;i++) {
//		var pair = vars[i].split("=");
//		if(pair[0] == variable){return pair[1];}
//	}
//	return(false);
//}
function getQueryString(variable) {
  let query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }// don't need else since if it matches, the function will end right after return
  console.log("Query: " + variable + " is not found");
}
//===========================================================

let xhr = new XMLHttpRequest();
// add the query string to the GET request 
// change the GET request to include the query string in its URL -> POST
xhr.open("POST", '/getDisplay');
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

// set up callback function that will run when the HTTP response comes back
xhr.onloadend = function(e) {
  console.log(xhr.responseText);
  // responseText is a string
  let data = JSON.parse(xhr.responseText);
  // get the postcard data out of the object "data" and
  // configure the postcard
  let postcardImage = document.getElementById("cardImg");
  postcardImage.style.display = 'block';
  postcardImage.src = data.image;
  let postcardMessage = document.getElementById("message");
  //postcardMessage.textContent = data.message;
  // textContent throws away newlines; so use innerText instead
  postcardMessage.innerText = data.message;
  postcardMessage.className = data.font;
  document.querySelector(".postcard").style.backgroundColor = data.color;
}

let idVariable = {
  "id": getQueryString("id")
};
// send off request
xhr.send(JSON.stringify(idVariable));

