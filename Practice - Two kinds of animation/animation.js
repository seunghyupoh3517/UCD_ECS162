let imageWrapper = document.getElementById("wrapper");
imageWrapper.addEventListener("click", toggle);

let timer;

function toggle(){
	let daisy = document.getElementById("daisy");
	let background = document.getElementById("background");
	let turtle = document.getElementById("turtle");
	if (daisy.className == "shown"){
		daisy.className = "hidden";
		background.className = "shown";
		turtle.className = "shown";
		startClock();
	}
	else{
		daisy.className = "shown";
		background.className = "hidden";
		turtle.className = "hidden";
		stopClock();
	}
}

function moveTurtle(pos){
	let turtle = document.getElementById("turtle");
	turtle.style.left = pos[0] + "%";
	turtle.style.top =  pos[1] + "%";
	pos = [pos[0] + 2, pos[1] + 1];

	if (pos[0] > 90){
		pos = [-40, 10];
	}
	return pos;
}

function startClock(){
	let pos = [-40, 10];
	timer = setInterval(function() {
		pos = moveTurtle(pos);
	} ,80);
}

function stopClock(){
	clearInterval(timer);
}

