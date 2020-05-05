// Always include at top of Javascript file
"use strict";

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
/*     */

var chooseColors = document.getElementsByClassName('square')[0].children;
for(var i = 0 ; i < chooseColors.length; i++){
    chooseColors[i].addEventListener( 'click', function(index) { 
    var backgroundColor = document.getElementById('postcard_wrap');
    backgroundColor.style.backgroundColor = this.style.backgroundColor;
    removeBorder(this); 
    this.style.border="1px solid black";
  });
}

function removeBorder(obj){
  for(var i = 0 ; i < chooseColors.length; i++){
    obj.parentNode.children[i].style.border="";   
  }
}

function imageChnage(obj){
  readURL(obj);
}

function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
          document.getElementById('blah').setAttribute('src',e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
}


var myObj = {photo: photo, message: "", color: chooseColors, font: fonts};
var myJSON = JSON.stringfy(myObj);
localStorage.setItem("postcardData",myJSON);


//편지지 폰트 클릭 이벤트
var fonts = document.getElementsByClassName('choose_font')[0].children;
for(var i = 0 ; i < fonts.length; i++){
  // fonts[i].style.fontFamily = fonts[i].textContent 폰트 이벤트 하드코딩안하고 할시
  fonts[i].addEventListener( 'click', function(index) {
    var font = document.getElementById('select_font');
    font.style.fontFamily = this.textContent.trim();
  });
}

//편지지색 클릭 이벤트
var chooseColors = document.getElementsByClassName('square')[0].children;
for(var i = 0 ; i < chooseColors.length; i++){
    chooseColors[i].addEventListener( 'click', function(index) { 
    var backgroundColor = document.getElementById('postcard_wrap');
    backgroundColor.style.backgroundColor = this.style.backgroundColor;
    this.parentElement.setAttribute('color-value',this.getAttribute('color-value')); //부모태그에 color-value 넣어주기
    removeBorder(this); //다른편지지색 선택시 기존 선택된 편지지 테두리 제거
    this.style.border="1px solid black";
  });
}

//다른편지지색 선택시 기존 선택된 편지지 테두리 제거
function removeBorder(obj){
  for(var i = 0 ; i < chooseColors.length; i++){
    obj.parentNode.children[i].style.border="";   
  }
}

//replace 버튼클릭시 파일업로드실행
document.getElementById('replaceId').addEventListener('click', () => {
  document.getElementById('upload_file').click()
})

//이미지 서버전송
function imageUpdateAjax(obj){
  var filedata = new FormData(); // FormData 인스턴스 생성
  filedata.append('uploadfile', obj.files[0]); //uploadfile 서버.js multer.single 이름과동일하게
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload', true); //post 방식, url, 비동기여부
  xhr.onload = function(event) {
    if (xhr.status == 200) {
      var imageName = xhr.response; //서버로부터 받은 이미지 파일명
      document.getElementById('blah').src="./images/"+imageName;
      document.getElementById('blah').style.display ="inline-block";
      document.getElementById('replaceId').style.display = "";
      document.getElementById("labelId").style.display = 'none';
    }
    else {
      console.log("서버저장 실패오류");
    }
  };
  xhr.send(filedata);
}

function sendPostCardAjax(obj){
  var xhr = new XMLHttpRequest();
  var data = {
    message: document.getElementById('select_font').value,
    font: document.getElementById('select_font').style.fontFamily.substring(1,document.getElementById('select_font').style.fontFamily.length-1),
    color: document.getElementsByClassName('square')[0].getAttribute('color-value'),
    photo: (document.getElementById('blah').src).replace(/^.*[\\\/]/, '')
  };
  xhr.onload = function() {
    if (xhr.status === 200 || xhr.status === 201) {
      console.log(xhr.responseText);
      location.href = "/easy-postcard-display.html";
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('POST', '/share');
  xhr.setRequestHeader('Content-Type', 'application/json'); // 컨텐츠타입을 json으로
  xhr.send(JSON.stringify(data)); // 데이터를 stringify해서 보냄
}
