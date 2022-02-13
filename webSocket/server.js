const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const port = 5050; //consider using port 80 or 443 due to problems with firewalls/proxies. Cannot listen on the same port that is hosting the live server.
const server = http.createServer(express);

const wss = new WebSocket.Server({ server });

var clientIDs = [];
var numOfClients;
var rooms = new Map();

wss.on('connection', function connection(ws)
{
	//numOfClients = Object.keys(clientUsernames).length;

	numOfClients = wss.clients.size;
	ws.id = clientIDs.length;
	clientIDs.push(ws);

	ws.on('close', function clientLeft()
	{
		console.log("\tClient has ended connection.")

		var code = ws.code;

		var tempRoomData = rooms.get(code);

		if (tempRoomData != null) //this condition is necessary because the FP uses websockets to send data. Updating it to use a form would make this check unnecessary.  
		{
			console.log("\troomData updated.")
			tempRoomData.curSize--;
			if (tempRoomData.curSize == 0)
			{
				rooms.delete(code);
			}
			else
			{
				rooms.set(code, tempRoomData);
			}
		}
	});

	ws.on('message', function incoming(data)
	{
		reportConnections(data);

		// data = "<pageFrom>;<roomCode>;<dataRequest>;<optionalData>..."
		var dataArr = data.split(";");
		var code = dataArr[1];//gets the code portion of the data
		

		switch (dataArr[0])
		{
			case "FP":
				if (dataArr[2] == "getPublic")
				{
					ws.send(getPublicRoom());
				}
				else
				{
					var avail = getRoomCodeAvail(code);
					ws.send(avail);
				}

				break;
			case "TTT":
				if (dataArr[2] == "queryPlayer")
				{
					var roomData;
					if (rooms.has(code)) //ie, someone else has already made the room, and is in the room. 
					{
						if (rooms.get(code).curSize >= 2)
						{
							ws.send("This room is full.")
						}
						else
						{
							roomData = rooms.get(code);
							roomData.curSize += 1;
							if (roomData.firstJoinerIsCross)
							{
								ws.send("nought");
								console.log("1");
							}
							else
							{
								ws.send("cross");
								console.log("2");
							}

							ws.code = code;
							rooms.set(code, roomData);
						}
					}
					else
					{
						roomData = new Object();
						roomData.maxSize = 2;
						roomData.curSize = 1;
						roomData.game = "TTT";
						roomData.bet = null; //only stores first submitted bet (since only 2 player bets need tyo be compared)
						roomData.move = null; //corresponds to the bet that is already stored.
						roomData.player = null; // corresponds to the player that submitted the bet
						roomData.firstJoinerIsCross = Math.random() < 0.5; //Decides if the first player to join also goes first in the game.

						if (roomData.firstJoinerIsCross)
						{
							ws.send("cross");
							console.log("3");
						}
						else
						{
							ws.send("nought");
							console.log("4");
						}

						ws.code = code;
						rooms.set(code, roomData);
					}
				}
				else if (dataArr[2] == "moveData")
				{
					roomData = rooms.get(code);
					
					if (roomData == undefined)
					{
						console.log("User attempted to access room that does not exist.");
						return null;
					}

					var movePartition = dataArr[3];
					var moveBet = dataArr[4];

					if (roomData.bet == null)
					{
						roomData.bet = moveBet;
						roomData.move = movePartition;
						//console.log(roomData);
						
						roomData.player = ws;
						
					}
					else
					{
						var firstPlayerWin;
						var winningBet;
						var moveString;

						if (roomData.bet == moveBet)
						{
							firstPlayerWin = (Math.random() < 0.5); //firstPlayerWin represents whether or not the person who submitted the bet first, won.
						}
						else
						{
							firstPlayerWin = (roomData.bet > moveBet);
						}
						
						winningBet = Math.max(moveBet, roomData.bet);

						if (firstPlayerWin)
						{
							moveString = roomData.move;
						}
						else
						{
							moveString = movePartition;
						}
						

						//that last boolean param sent reprents whether or not *that* player won the bet.
						roomData.player.send(moveString + ";" + firstPlayerWin.toString() + ";" + winningBet.toString());
						ws.send(moveString + ";" + (!firstPlayerWin).toString() + ";" + winningBet.toString());

						roomData.bet = null;
						roomData.move = null;
						roomData.player = null;
					}
				}
		}
	})
})


server.listen(port, function ()
{
	console.log(`Server is listening on ${port}!`)
})

function reportConnections(data)
{
	console.log("Current Num. of connections: " + numOfClients);
	console.log("Recieved data: " + data);
}

function getPublicRoom()
{
	var checkCurRoom = 0;

	while (true)
	{
		var publicRoomData = rooms.get(checkCurRoom);

		if (publicRoomData == null || publicRoomData.curSize < 2)
		{
			return checkCurRoom;
		}

		checkCurRoom++;
	}
}

function getRoomCodeAvail(code, gameType)
{
	var blackListedCodes = new Set(["public", "null"]);
	if (blackListedCodes.has(code))
	{
		return "Blacklisted Code";
	}

	if (code == "")
	{
		while (true)
		{
			var randCode = makeid(10);
			if (!privateRooms.has(randCode))
			{
				return randCode;
			}
		}
	}

	var roomCodeExists = rooms.has(code);
	if (roomCodeExists)
	{
		var roomData = rooms.get(code);
	}

	if (!roomCodeExists)
	{
		return "Valid Room Code";
	}
	else if (roomCodeExists && (roomData.curSize < roomData.maxSize))
	{
		return "Room Not Full";
	}
	else
	{
		return "Room Not Available";
	}
}

function makeid(length)
{
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++)
	{
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}



