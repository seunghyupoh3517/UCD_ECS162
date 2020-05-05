// Always include at top of Javascript file
"use strict";

let font=["Indie Flower",
  "Dancing Script",
  "Long Cang",
  "Homemade Apple"]
let color=["#e6e2cf", "#dbcaac",
  "#c9cbb3", "#bbc9ca",
  "#a6a5b5", "#b5a6ab",
  "#eccfcf", "#eceeeb",
  "#bab9b5"]

/*
// UPLOAD IMAGE using a post request
// Called by the event listener that is waiting for a file to be chosen
function uploadFile() {
  
    // get the file chosen by the file dialog control
    const selectedFile = document.getElementById('fileChooser').files[0];
    // store it in a FormData object
    const formData = new FormData();
    // name of field, the file itself, and its name
    formData.append('newImage',selectedFile, selectedFile.name);

    // build a browser-style HTTP request data structure
    const xhr = new XMLHttpRequest();
    // it will be a POST request, the URL will this page's URL+"/upload" 
    xhr.open("POST", "/upload", true);
  
    // callback function executed when the HTTP response comes back
    xhr.onloadend = function(e) {
        // Get the server's response body
        console.log(xhr.responseText);
        // now that the image is on the server, we can display it!
        let newImage = document.getElementById("serverImage");
        newImage.src = "../images/"+selectedFile.name;
    }
  
    // actually send the request
    xhr.send(formData);
}

// Add event listener to the file input element
var photo = document.getElementById("fileChooser").addEventListener("change",uploadFile);

var fonts = document.getElementsByClassName('choose_font')[0].children;
for(var i = 0 ; i < fonts.length; i++){
  fonts[i].addEventListener( 'click', function(index) {
    var font = document.getElementById('select_font');
    font.style.fontFamily = this.textContent;
  });
}
*/
