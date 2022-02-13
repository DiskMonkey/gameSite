//var roomCodeBox = document.getElementById("roomCodeForm");
function toggleRoomCodeVis()
{
	var roomCodeBox = document.getElementById("privateRoomForm");

	if (roomCodeBox.style.display == "none")
	{
		roomCodeBox.style.display = "inline";
	}

}

var gameSelect;
function isGameChosen()
{
	var gameSelectExists = document.querySelector('input[name="game"]:checked');

	if (gameSelectExists == null)
	{
		alert("Please choose a game.");
		return false;
	}
	else
	{
		gameSelect = gameSelectExists.value;
		return true;
	}
}

var roomCode; //needs to be global to send room code to server later
function createURL()
{
	var urlBuilder = "../";

	switch (gameSelect)
	{
		case "Betting TTT":
			urlBuilder += "ttt/clientTTT.html";
			break;
		case "Test":
			break;
	}

	roomCode = document.getElementById("roomCode").value;
	urlBuilder += "?room=" + roomCode;
	return urlBuilder;
}

function publicURLPromise()
{
	var urlBuilder = "../";

	switch (gameSelect)
	{
		case "Betting TTT":
			urlBuilder += "ttt/clientTTT.html";
			break;
		case "Test":
			break;
	}

	return new Promise(function (resolve, reject)
	{
		ws.send("FP;public;getPublic")
		messagePromise(ws).then(function setPublicCode(publicCode)
		{
			roomCode = publicCode;
			urlBuilder += "?room=" + roomCode;
			resolve(urlBuilder);
		});
	})
}


var url;
var type = "";
var ws;
initWebSocket().then(function (wsLocal) { ws = wsLocal }); //Maybe put this declaration, setgame(), and createURL(), into another function that is called automatically with any button press. This might avoid code repetition, though it would be kinda clunky.
function joinPublic()
{
	if (isGameChosen())
	{
		type = "public";
		publicURLPromise().then(function (publicURL)
		{
			window.location.href = publicURL;
		});
	}
}
function joinPrivate()
{
	if (isGameChosen())
	{
		type = "joinprivate";
		sendDataToServer(ws);
		url = createURL(type);
	}
}
function createPrivate()
{
	if (isGameChosen())
	{
		type = "createprivate";
		sendDataToServer(ws);
		url = createURL(type);
	}
}


function sendDataToServer(websocket) 
{
	websocket.send("FP;" + roomCode + ";" + type);
	console.log("Message sent.")
	websocket.onmessage = ({ data }) => onReceive(data);
}

var recievedData;
function onReceive(data)
{
	recievedData = data;

	switch (type)
	{
		case "joinprivate":
			if (data == "Room Not Full")
			{
				ws.close();
				window.location.href = url;
			}
			else
			{
				window.alert("Game is already full.");
			}
			break;
		case "createprivate": //room param might be empty
			if (data == "Valid Room Code")
			{
				ws.close();
				window.location.href = url;
			}
			else
			{
				window.alert("Game Code already in use. Please choose a different code.");
			}
	}
}
