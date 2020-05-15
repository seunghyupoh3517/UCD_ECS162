// server.js
// where your node app starts

// include modules + API Key
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const sql = require("sqlite3").verbose();
const FormData = require('form-data');

// Generate random string/characters in JavaScript - https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
   var result           = '';
   var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789'; //26 + 10 ABCDEFGHIJKLMNOPQRSTUVWXYZ
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

//======================== BUILDING DATABASE ===============================
// This creates an interface to the file if it already exists, and makes the file if it does not. 
const postcardDB = new sql.Database("postcards.db");

let cmd = "SELECT name FROM sqlite_master WHERE type='table' AND name='postcards'";
postcardDB.get(cmd, function (err, val) {
    console.log(err, val);
    if (val == undefined) {
        console.log("No database file - creating one");
        createStudentDB();
    } else {
        console.log("Database file found");
    }
});

function createStudentDB() {
  const cmd = "CREATE TABLE postcards (id TEXT PRIMARY KEY UNIQUE, image TEXT NOT NULL, color TEXT NOT NULL, font TEXT NOT NULL, message TEXT NOT NULL)";
  postcardDB.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure",err.message);
    } else {
      console.log("Created database");
    }
  });
}
//======================== DATABASE =========================================

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/images')    
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
// let upload = multer({dest: __dirname+"/assets"});
let upload = multer({storage: storage});

//===========================================================================

// begin constructing the server pipeline
const app = express();

// Serve static files out of public directory
app.use(express.static('public'));

// Also serve static files out of /images
app.use("/images",express.static('images'));

// Handle GET request to base URL with no other route specified
// by sending creator.html, the main page of the app
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/public/creator.html');
});

// Next, the the two POST AJAX queries

// Handle a post request to upload an image. 
app.post('/upload', upload.single('newImage'), function (request, response) {
  console.log("Received",request.file.originalname,request.file.size,"bytes");
  let apiKey = process.env.ECS162KEY;
  //not necessary since I am assigning my key here already
  //if (apiKey === undefined) {
  //  serverResponse.status(400);
  //  serverResponse.send("No API key provided");
  //} else {
  if(request.file) {
    // file is automatically stored in /images, 
    // even though we can't see it. 
    // We set this up when configuring multer
    let form = new FormData();
    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + "/images/" + request.file.originalname));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(err, APIres) {
      // did we get a response from the API server at all? - Ok We did
      if (APIres) {
        // no need to leave the image on images, delete it from the local directory
        fs.unlinkSync(__dirname + "/images/" + request.file.originalname);
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser 
        // module handles for us in Express.  
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            response.status(400); // bad request
            response.send(" Media server says: " + body);
          } else {
            response.status(200);
            response.send(body);
          }
        });
      } else { // didn't get APIres at all
        response.status(500); // internal server error
        response.send("Media server seems to be down.");
      } 
    });
    //response.end("recieved "+request.file.originalname); -- redundant --> technically no difference in between response.end() and response.send()
  } else throw 'error';
});

// Handle a post request containing JSON
app.use(bodyParser.json());
// gets JSON data into req.body
app.post('/saveDisplay', function (req, res, next) {
  console.log(req.body);
  // instead of saving it into postcardData.json, save it into database, postcardDB
  // write the JSON into postcardData.json
  //fs.writeFile(__dirname + '/public/postcardData.json', JSON.stringify(req.body), (err) => {
  //  if(err) {
   //   res.status(404).send('postcard not saved');
  //  } else {
  //    res.send("All well")
  //  }
  //});
  // need a random string as an id for each postcard to put it into URL
  let id = makeid(22); // not quite sure why it has to be exactly 22 characters tho but that's what ppl said on piazza
  let postImage = req.body.image;
  let postColor = req.body.color;
  let postFont = req.body.font;
  let postMessage = req.body.message;
  let cmd = "INSERT INTO postcards (id, image, color, font, message) VALUES (?,?,?,?,?) ";
  postcardDB.run(cmd, id, postImage, postColor, postFont, postMessage, function(err){
    if(err){
      //console.log("DB insert error", err.message);
        res.status(404).send('postcard not saved');
        //next();
      } else{
        //newId = this.lastID; // the rowid of last inserted item ------------
       let idVariable = {
          "id": id
        };
        res.send(JSON.stringify(idVariable));
    }
  });  
});

app.post('/getDisplay', function (req, res) {
  console.log(req.body);
  //let r = req.query.id;
  //console.log("The id is " + r);
  let cmdl = "SELECT * FROM postcards WHERE id=?";
  console.log(cmdl);
  postcardDB.get(cmdl, req.body.id, function(err, rows) {
    if(err){
      //console.log("Database reading error", err.message);
      res.status(404).send('postcard not found');
      //next();
    } else{
      console.log(rows); //----------------
      let newData = {
        "image": rows.image,
        "color": rows.color,
        "font": rows.font,
        "message": rows.message
      };
      //res.json(newData); //------------
      res.send(JSON.stringify(newData)); //--------------
    }
  });
});

// The GET AJAX query is handled by the static server, since the 
// file postcardData.json is stored in /public

// custom 404 message for when no other response worked
app.all("*", function (req, res) { 
  res.status(404);  // the code for "not found"
  res.send("This is not the droid you are looking for"); });

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
