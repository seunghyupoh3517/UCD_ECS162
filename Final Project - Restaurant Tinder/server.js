// socket.io / node websocket / websocket - can use any of them
// ws: a Node.js Websocket library - npmjs.com/package/ws
const WebSocket = require('ws');

const express = require("express");
const app = express();
const http = require("http"); // need base server on top of express app server
const yelp = require('yelp-fusion');
const bodyParser = require("body-parser");
const fs = require('fs');

// 
// YELP FUSION API KEY + Client ID (https://www.yelp.com/developers/v3/manage_app)
const client = yelp.client(process.env.YELP_API_KEY);

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public")); 
app.use(bodyParser.json());
// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

app.get("/cities", function(req, res){
  let file = fs.readFileSync('cities.json');
  let t = JSON.parse(file);
  res.json(t);
})

// autocomplete2 -> just to test, differentiate from the app.get
app.post("/autocomplete", function(request, res){
  let searchBtn = {text: request.body.value};
  let result = 0;
  client.autocomplete(searchBtn).then(response => {
    result = response.jsonBody;
    res.send(result);
    res.end();
  });
  //.catch(e => {
  //        console.log(e);
  //      });  
});

const server = http.createServer(app); // express, base server
const wss = new WebSocket.Server({server}); // websocket, implemented upon the base server

// Not necesserily need to save the progress of the poll in our own database - currently below, saving in the memory ram
// const restaurantList = [["AAA", "BBB"], ["CCC","DDD"], ["EEE","FFF"], ["GGG","HHH"]];
// const restaurantCount = [[0,0], [0,0], [0,0], [0,0]];

// data variable
const restNum = 8; // Retrieve 12 restaurants from YELP FUSION
let restList = []; // list of called restaurants
let winningList = []; // pass on to next round

// local data variable
let clientCount = 0;
let voteCount = 0;
let left = 0; // index of left side of current pair from the restList
let right = 0; // index of right side of current pair from the restList
let leftVote = 0; // to count who's the winner
let rightVote = 0; // to count who's the winner
let round = 1; // starting from round 1
let restaurantIndex = 0;
let numTie = 0; // keep track of numbers of tie for the pair
// make sure only the first tie will let the pair to proceed to next round
// if it's second tie, break it -> multiple winner results

wss.on('connection', (ws) => {
  clientCount += 1;
  // ? Need to be modified based on how we put restuarant list into database -> no database utilization
  restaurantIndex = 0; // ? as we are not restarting the server for the server  
  console.log("a new user connected -- ", clientCount, " users connected");
  
  // Reset the variables every pair, round
  voteCount = 0;
  left = 0;
  right = 0;
  leftVote = 0;
  rightVote = 0;
  round = 1;
  numTie = 0;
  
  
  ws.on('message', (message) => {
    //console.log(message)
    //ws.send("server echo:" + message);
    //broadcast(message)
    
    // ? - game logic need to be implemented here, how to decide the winning restaurant
    let cmdObj = JSON.parse(message);
    
    if (cmdObj.type == 'command')
    {
      restaurantIndex++;
      var vote = cmdObj.selection;
      console.log("one user selected restaurant");//, restList[restaurantIndex][vote]);
      
      if (vote == 0)
        leftVote = leftVote + 1;
      else // vote == 1
        rightVote = rightVote + 1;
      voteCount = voteCount + 1;
      
      if (voteCount == clientCount)
      {
          console.log("next pair");
          // Reset
          voteCount = 0;
          // Check who's winning : left, right, tie (both)
          var lost = 0;
          var won = 0;
          
          if (rightVote > leftVote){ // right 
            lost = left;
            won = right;
          }
          else if (leftVote > rightVote){ // left
            lost = right;
            won = left;
          }
          else{ // tie -> keep track of numTie
            // two cases -> first tie, second tie repeated -> break it, randomly pick the winner 
            if (numTie == 0){
              lost = -1; // whether left or right, either one doesn't matter as it's tie but we know there's tie by -1 on either side
              numTie = numTie + 1;
            }
            else{
              // randomly pick the winner 
              if (Math.floor(Math.random() * 2) == 0){ // 0 or 1
                lost = left;
                won = right;
              }
              else{
                lost = right;
                won = left;
              }
              // reset 
              numTie = 0;
            }
          }
          // left = 0; keep track of them
          // right = 0;
          leftVote = 0;
          rightVote = 0;
        
          // No tie then delete the lost from the restaurant list; otherwise, pass pair to the next round -> no deletion needed
          if (lost != -1) restList.splice(lost, 1);
          
          if(restList.length == 1){ //last restaurant left in the list -> winner -> no multiple winners due to randompick
            var endgame = {
              type : "Result",
              winner: restList[0] // first index
            };
            broadcast(JSON.stringify(endgame));
          } else{ // if it's not the end of the game, call the next pair -> next round
            var pair = randomPick();
            left = pair[0];
            right = pair[1];
            var result = [restList[left], restList[right]];
            round = round + 1;
            var cmdObj1 ={
              type: 'command',
              info: result,
              round: round
            };
            broadcast(JSON.stringify(cmdObj1));
          }
      }
    } // check for the search reqeust -> START NEW GAME
      else if(cmdObj.type == 'message'){
        var location = cmdObj.msg[1];
        //var keyword = cmdObj.msg[0];
        var term = cmdObj.msg[0];
        const searchBtn = {
          term: term,
          location: location
          
        };
        // Retrieving data from YELP FUSION API
        client.search(searchBtn).then(response => {
          for (var i = 0; i < restNum; i++){
            var result = response.jsonBody.businesses[i];
            restList[i] = JSON.stringify(result, null, 2);
          }
          var pair = randomPick();
          left = pair[0];
          right = pair[1];
          var pair1 = [restList[left], restList[right]];
          var cmdObj2 = {
            type: 'command',
            info: pair1,
            round: round
          };
          broadcast(JSON.stringify(cmdObj2));
        })
        .catch(e => {
          console.log(e);
        });
    }
  });
  
  ws.on('close', ()=>{
    clientCount -= 1;
    console.log("a user disconnected -- ", clientCount, " users connected");
  });
  
  ws.send('connected!')
});

// Randomly picked pair - select random element from the array
// https://www.geeksforgeeks.org/how-to-select-a-random-element-from-array-in-javascript/
function randomPick() {
  var left = Math.floor(Math.random() * restList.length);
  var right = Math.floor(Math.random() * restList.length);
  // Until left != right, run a loop assigning another value to right 
  while (left == right){ // if X, same number can be assigned to right -> no more new num, break, game ends
    right = Math.floor(Math.random() * restList.length);
  }
  return [left, right];
}

// clients = set of active connections, active ws from above
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

//start our server
server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});


