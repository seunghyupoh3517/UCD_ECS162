function display(gList){
	let theList = document.getElementById("gransList");
	for (let i in gList){
		let newItem = document.createElement("li");
		newItem.textContent = gList[i];
		theList.appendChild(newItem);
	}
}

getListFromServer();

function getListFromServer(){
	let url = "shoppingList";

	let xhr = new XMLHttpRequest;
	xhr.open("GET", url);

	xhr.addEventListener("load", function(){
		if(xhr.status == 200){
			let responseStr = xhr.responseText;
			let gList = JSON.parse(responseText);
			display(gList);
		} else{
			console.log(xhr.responseText);
		}
	});
	xhr.send();
}