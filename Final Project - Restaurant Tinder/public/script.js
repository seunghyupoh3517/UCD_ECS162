// client-side js, loaded by index.html
// run by the browser each time the page is loaded
const url = "wss://tinder-websocket-final.glitch.me";
const connection = new WebSocket(url);

// set up the event listener and all the dynamic variables from DOM
let e = document.getElementById("newMsg");
let e2 = document.getElementById("newMsg2");

let startGame = document.getElementById("startGame");
startGame.addEventListener("click", startNewGame);

let submit = document.getElementById("submit");
submit.addEventListener("click", sendNewMsg);

let header = document.getElementById("header");
let linkDiv = document.getElementById("linkDiv");
let clientLink = document.getElementById("link");

let button1 = document.getElementById("leftLike");
let button2 = document.getElementById("rightLike");

let progressBar = document.getElementById("progress");
let round= document.getElementById("round");

let restSection = document.getElementById("restSection");
let categoryDiv = document.getElementById("categoryDiv");

let leftName= document.getElementById("leftName");
let rightName= document.getElementById("rightName");

let leftImg= document.getElementById("leftImg");
let rightImg= document.getElementById("rightImg");

let leftPrice= document.getElementById("leftPrice");
let rightPrice= document.getElementById("rightPrice");

let leftAddress= document.getElementById("leftAddress")
let rightAddress= document.getElementById("rightAddress");

let leftReviews= document.getElementById("leftReviews");
let rightReviews= document.getElementById("rightReviews");

let leftStar = document.getElementById("leftStars");
let rightStar = document.getElementById("rightStars");

let leftRest =document.getElementById("restLeft");
let rightRest =document.getElementById("restRight");
// to keep it up with the round's selection 
let gameStatus = 1;

//adds random number to the client url
let randNum = '';
for(let i =0; i<10; i++){
  randNum += Math.floor(Math.random() * 10);
}
clientLink.href = "https://tinder-websocket-final.glitch.me/client.html" + "?id=" + randNum;
clientLink.textContent = "https://tinder-websocket-final.glitch.me/client.html" + "?id=" + randNum;


//css animation when Starting new game.
function startNewGame(){
  header.classList.add("hidden");
  linkDiv.classList.add("hidden");
  categoryDiv.classList.remove("hidden");
}

function sendNewMsg() {
  let msg= [e.value, e2.value]
  let msgObj = {
    "type": "message",
    "from": "host",
    "msg": msg
  }
  
  connection.send(JSON.stringify(msgObj));
  e.value = null;
  e2.value=null;
  progressBar.classList.remove("hidden");
  restSection.classList.remove("hidden");
  round.classList.remove("hidden");
  categoryDiv.classList.add("hidden");
}

e.addEventListener("input",() => {
  console.log("change");
  console.log(e.value);
  // store it in a FormData object
  const formData = new FormData();
  // name of field, the file itself, and its name
  formData.append('searchVal',e.value);
  
  let data=JSON.stringify({value: e.value});

  // build a browser-style HTTP request data structure
  const xhr = new XMLHttpRequest();
  // it will be a POST request, the URL will this page's URL+"/upload" 
  xhr.open("POST", "/autocomplete", true);
  //xhr.open("GET","/autocomplete");
  xhr.setRequestHeader("Content-Type", "application/json; chaset=UTF-8");
  // callback function executed when the HTTP response comes back
  xhr.onloadend = function(event) {    
    let ourData = JSON.parse(xhr.responseText);   
    // now that the image is on the server, we can display it!
    let searchTerms= document.getElementById("searchTerms");
    var str=''; // variable to store the options    
    for (var i=0; i < ourData.categories.length;i++){
      str += '<option value="'+ourData.categories[i].title+'" />'; 
    }
    for (var i=0; i < ourData.terms.length;i++){
      str += '<option value="'+ourData.terms[i].text+'" />'; 
    }
    console.log(str);
    searchTerms.innerHTML = str;
  }
  // actually send the request
  xhr.send(data); 
});

//autocomplete for Location input
const e2_xhr = new XMLHttpRequest();
e2_xhr.open("GET", "/cities", true);

e2_xhr.addEventListener("load", function() {
    if (e2_xhr.status == 200) {
      let loc = document.getElementById("locationTerm");
      let opt = '';
      let responseObj = JSON.parse(e2_xhr.responseText);
      for (var i=0; i < responseObj.cities.length;i++){
        opt += '<option value="'+responseObj.cities[i]+'" />'; 
      }

      loc.innerHTML = opt;
    } else {
      console.log(e2_xhr.responseText);
    }
});
// Actually send request to server
e2_xhr.send();


button1.addEventListener("click", () => {
  progressBar.textContent = "Waiting...";
  let cmdObj = {
    "type": "command",
    "selection": 0
  }
  if (gameStatus){
    connection.send(JSON.stringify(cmdObj));
    gameStatus= 0;
  }
});

button2.addEventListener("click", () => {
  progressBar.textContent = "Waiting...";
  let cmdObj = {
    "type": "command",
    "selection": 1
  }
  if (gameStatus){
    connection.send(JSON.stringify(cmdObj));
    gameStatus= 0;
  }
  
});

// create the paragraph tag in dom to display the winnder and send the message
let addMessage = function(message) {
  const pTag = document.createElement("p");
  pTag.appendChild(document.createTextNode(message));
  document.getElementById("messages").appendChild(pTag);
};

//connection.onopen = () => {
//  connection.send(JSON.stringify({"type":"helloHost"}));
//};

//connection.onerror = error => {
//  console.log(`WebSocket error: ${error}`);
//};

// star treating 
// the winner page calls the page 

// all copy to the client.js
connection.onmessage = event => {
  console.log(event.data);
  let msgObj = JSON.parse(event.data);
  if (msgObj.type == "message") {
    addMessage(msgObj.from+": "+msgObj.msg);
  }
  else if(msgObj.type == "Result"){
    gameStatus = 0;
    round.classList.add("hidden");
    progressBar.textContent = "Winner! Let's go to: ";
    let lInfo = JSON.parse(msgObj.winner);
    let rInfo = JSON.parse(msgObj.winner);
    console.log(lInfo);
    console.log(lInfo.name);
    leftName.innerHTML= lInfo.name;
    rightName.innerHTML= rInfo.name;
    //in case the price doesnt come up
    if (!lInfo.price){leftPrice.innerHTML = "$$";}
    else{leftPrice.innerHTML = lInfo.price;}
    if (!rInfo.price){rightPrice.innerHTML = "$";}
    else{rightPrice.innerHTML = rInfo.price;}
    
    // star rating -> wo fontawesome within array, couldnt call it directly from the YELP FUSION
    let lRating = lInfo.rating;
    let rRating = rInfo.rating;
    let lIcons = leftStar.children;
    let rIcons = rightStar.children;
    for (let i = 0; i < lIcons.length; i++) {
      if (i < Math.floor(lRating)) {
        lIcons[i].className = "fas fa-star";
      } else {
        lIcons[i].className = "far fa-star";
      }
    }
    for (let i = 0; i < rIcons.length; i++) {
      if (i < Math.floor(rRating)) {
        rIcons[i].className = "fas fa-star";
      } else {
        rIcons[i].className = "far fa-star";
      }
    }
    // calling the direct html and retreive the data from it
    //query statement -> changing the DOM add the new elements 
    leftImg.style.backgroundImage= "url("+lInfo.image_url+")";
    rightImg.style.backgroundImage= "url("+rInfo.image_url+")";
    leftAddress.innerHTML= lInfo.location.address1+", "+lInfo.location.city+", "+lInfo.location.state+", "+lInfo.location.zip_code;
    rightAddress.innerHTML= rInfo.location.address1+", "+rInfo.location.city+", "+rInfo.location.state+", "+rInfo.location.zip_code;
    leftReviews.setAttribute('href', lInfo.url);
    rightReviews.setAttribute('href', rInfo.url);
    rightRest.classList.add("hidden");
    leftRest.classList.add("winner");
  }
  
  else if (msgObj.type == 'command')
  {
    gameStatus = 1;
    round.textContent = "Round " + msgObj.round;
    progressBar.textContent = "Please choose...";
    let lInfo = JSON.parse(msgObj.info[0]);
    let rInfo = JSON.parse(msgObj.info[1]);
    console.log(lInfo);
    console.log(lInfo.name);
    leftName.innerHTML= lInfo.name;
    rightName.innerHTML= rInfo.name;
    //in case the price doesnt come up
    if (!lInfo.price){leftPrice.innerHTML = "$$";}
    else{leftPrice.innerHTML = lInfo.price;}
    if (!rInfo.price){rightPrice.innerHTML = "$";}
    else{rightPrice.innerHTML = rInfo.price;}
    
    let lRating = lInfo.rating;
    let rRating = rInfo.rating;
    let lIcons = leftStar.children;
    let rIcons = rightStar.children;
    for (let i = 0; i < lIcons.length; i++) {
      if (i < Math.floor(lRating)) {
        lIcons[i].className = "fas fa-star";
      } else {
        lIcons[i].className = "far fa-star";
      }
    }
    for (let i = 0; i < rIcons.length; i++) {
      if (i < Math.floor(rRating)) {
        rIcons[i].className = "fas fa-star";
      } else {
        rIcons[i].className = "far fa-star";
      }
    }
    //query statement
    //target href using the ankor
    leftImg.style.backgroundImage= "url("+lInfo.image_url+")";
    rightImg.style.backgroundImage= "url("+rInfo.image_url+")";
    leftAddress.innerHTML= lInfo.location.address1+", "+lInfo.location.city+", "+lInfo.location.state+", "+lInfo.location.zip_code;
    rightAddress.innerHTML= rInfo.location.address1+", "+rInfo.location.city+", "+rInfo.location.state+", "+rInfo.location.zip_code;
    leftReviews.setAttribute('href', lInfo.url);
    rightReviews.setAttribute('href', rInfo.url);    
  }
  else {
    addMessage(msgObj.type);
  }
};
/*
// ? button1, button2 event listener need to be improved (cmdObj)
button1.addEventListener("click", () => {
  progressBar.textContent = "Waiting...";
  let cmdObj = {
    "type": "command",
    "selection": 0
  }
  connection.send(JSON.stringify(cmdObj));
});

button2.addEventListener("click", () => {
  progressBar.textContent = "Waiting...";
  let cmdObj = {
    "type": "command",
    "selection": 1
  }
  connection.send(JSON.stringify(cmdObj));
});
*/
// --------------------------------------------------------------
