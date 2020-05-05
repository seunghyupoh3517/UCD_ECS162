var fs = require('fs');
// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();

// not needed now, but may be useful? 
const assets = require('./assets');

// Multer is a module to read and handle FormData objects, on the server side
const multer = require('multer');

//바디파싱 모듈임포트
var bodyParser = require("body-parser");
//이거 뭔지 모름
var jsonData = bodyParser.json();

// Make a "storage" object that explains to multer where to store the images...in /images
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/images')    
  },
  // keep the file's original name
  // the default behavior is to make up a random string
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

// Use that storage object we just made to make a multer object that knows how to 
// parse FormData objects and store the files they contain
let uploadMulter = multer({storage: storage});

// First, server any static file requests
app.use(express.static('public'));

// Next, serve any images out of the /images directory
app.use("/images",express.static('images'));

// Next, serve images out of /assets (we don't need this, but we might in the future)
app.use("/assets", assets);

//메인페이지
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/public/easy-postcard-creator.html');
});

//share postcards 누른 페이지
app.get("/easy-postcard-display", function (request, response) {
  response.sendFile(__dirname + '/public/easy-postcard-display.html');
});
//share 보냈을때 데이터 셋팅
app.get("/getCardData",function(request,response){
  
  fs.readFile('postcardData.json', "utf8", function(err, data) {
    if (err) throw err;
    //파일 읽은 데이터 set
    var cardData = JSON.parse(data);
    //화면에 전송
    response.end(JSON.stringify(cardData));
  });
})

// Next, handle post request to upload an image
// by calling the "single" method of the object uploadMulter that we made above
app.post('/upload', uploadMulter.single('uploadfile'), function (request, response) {
  // file is automatically stored in /images
  // WARNING!  Even though Glitch is storing the file, it won't show up 
  // when you look at the /images directory when browsing your project
  // until later (or unless you open the console (Tools->Terminal) and type "refresh").  
  // So sorry. 
  console.log("Recieved",request.file.originalname,request.file.size,"bytes")
  // the file object "request.file" is truthy if the file exists
  if(request.file) {
    // Always send HTTP response back to the browser.  In this case it's just a quick note. 

    //종완 : 이미지 이름만 전달하여 화면에서 붙여준다.
    response.end(request.file.originalname);
  }
  else throw 'error';
})

app.post("/share", jsonData, function(request, response) {

  //데이터 잘 넘어오는지 확인
  console.log(JSON.stringify(request.body));

  //파일로 떨구기
  //파일이름, 저장할 파일
  fs.writeFile('postcardData.json',JSON.stringify(request.body),function(err){
    if (err === null) {
      console.log('Succeeded saving into a file'); 
    } else {
      console.log('Failed saving into a file');
    } 
  });
  
  //화면으로 데이터 전송
  response.end(JSON.stringify(request.body));
});

// listen for HTTP requests :) //
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

var jsonObj = null;

