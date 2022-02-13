var wsGlobal;
var roomCode;
var waitingForOpponent;
var playerIsCross;

initWebSocket().then(function querytttRooms(ws)
{
	wsGlobal = ws;
	var urlParams = new URLSearchParams(window.location.search);
	roomCode = urlParams.get("room");
	playerIsCross = urlParams.get("player"); //this value is purely cosmetic.

	console.log(ws)
	if (playerIsCross == null)
	{
		ws.send("TTT;" + roomCode + ";queryPlayer");
		messagePromise(ws).then(function playerCoinFlipRecieved(coinFlip)
		{
			playerIsCross = (coinFlip == "cross"); //maybe move this coinflip to the FP side, so that history has mininal clutter

			if (coinFlip == "This room is full.")
			{
				alert(coinFlip);
			}
			else
			{
				insertURLParam("player", coinFlip);
			}
		});
		
		//write function that sets timer to automatic bet submission (afk kick)
	}
});

function sendMove(partition, bet)
{
	//home vs away terms: home refers to cur client, while away refers to opponent.
	var homeMoveString = partition.toString();
	var betString = bet.toString();

	wsGlobal.send("TTT;" + roomCode + ";moveData;" + homeMoveString + ";" + betString);
	messagePromise(wsGlobal).then(function response(data)
	{
		onBetResult(data);
	});
}


