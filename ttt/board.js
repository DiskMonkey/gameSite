//grid dimensions in boxes
let rows = 3;
let columns = 3;

//box dimensions in pixels
let height = 100;
let width = 100;

//grid width and height in pixels
let bw = columns * width;
let bh = rows * height;

//padding around grid in pixels
let gridPadding = 10;

//size of canvas in pixels
let cw = bw + gridPadding * 2 + 1;
let ch = bh + gridPadding * 2 + 1;

//mouse position
let mouseXpos = -1;
let mouseYpos = -1;
let partition = ["Outside of Box"];
let insideBox = false;

//canvas initialization
let canvasTop = $("<canvas/>")
	.attr({
		width: cw,
		height: ch,
	})
	.appendTo("body");
let context = canvasTop.get(0).getContext("2d");

//player stats
//let curTurnIsCross = true; //if false, then cur turn is naughts
let winner = "Undecided";

//game stats. empty position is marked as -1.
let gameBoard = [
	[-1, -1, -1],
	[-1, -1, -1],
	[-1, -1, -1],
];
let chosenMove = ["Unchosen"];

let gameState = "In Play";

//functions
function drawBoard()
{
	for (let x = 0; x <= bw; x += width)
	{
		context.moveTo(0.5 + x + gridPadding, gridPadding);
		context.lineTo(0.5 + x + gridPadding, bh + gridPadding);
	}

	for (let x = 0; x <= bh; x += height)
	{
		context.moveTo(gridPadding, 0.5 + x + gridPadding);
		context.lineTo(bw + gridPadding, 0.5 + x + gridPadding);
	}

	context.strokeStyle = "black";
	context.stroke();
}

function getMousePos(canvas, evt)
{
	let rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top,
	};
}

function logPos(e)
{
	let coords = getMousePos(canvasTop.get(0), e);
	document.getElementById("coords").innerHTML = coords.x + ", " + coords.y;

	mouseXpos = coords.x - gridPadding;
	mouseYpos = coords.y - gridPadding;

	let x = mouseXpos;
	let y = mouseYpos;

	insideBox = 0 < x && x < width * columns && 0 < y && y < height * rows;

	if (insideBox)
	{
		partition = [Math.trunc(x / width), Math.trunc(y / height)];
	}
	else
	{
		partition = ["Outside of Box"];
	}

	document.getElementById("partition").innerHTML = partition;
}

function makeMove()
{
	let openPosition = false;
	let partitionFinal = chosenMove;
	let bet = document.getElementById("bet").value

	if (bet > parseInt(document.getElementById("bank").innerText, 10))
	{
		alert("Your bet must be equal to, or less than, your bank balance.");
		return null;
	}

	if (partitionFinal == "Unchosen")
	{
		alert("Click a valid space before you click submit.");
		return null;
	}

	openPosition = gameBoard[partitionFinal[1]][partitionFinal[0]] == -1;

	if (openPosition && gameState == "In Play")
	{
		sendMove(partitionFinal, bet);

	}

}

function onBetResult(moveString)
{
	var data = moveString.split(";");
	var opponentPartition = data[0].split(",");
	var clientWon = (data[1] == "true");
	var winningBet = parseInt(data[2], 10);

	var newBankVal;
	var newOppBankVal;

	if (clientWon) //updates the banks
	{
		newBankVal = parseInt(document.getElementById("bank").innerText, 10) - winningBet;
		newOppBankVal = parseInt(document.getElementById("oppBank").innerText, 10) + winningBet;
	}
	else
	{
		newBankVal = parseInt(document.getElementById("bank").innerText, 10) + winningBet;
		newOppBankVal = parseInt(document.getElementById("oppBank").innerText, 10) - winningBet;
	}

	document.getElementById("bank").innerText = newBankVal;
	document.getElementById("oppBank").innerText = newOppBankVal;

	//in case submit bet is updated to use a form, make sure to update its min and max values right here. Currently, an alert is triggered when an invalid bet is given.
	clearChosenMove();
	writeImageToCanvas(opponentPartition, (playerIsCross == clientWon));

	if (checkVictoryCondition())
	{
		gameState = "Game Over";
		victory();
	}
}

let imagePad = 5;
function writeImageToCanvas(partitionLocal, isCross)
{
	let base_image = new Image();

	if (isCross)
	{
		base_image.src = "../assets/cross.png";
		gameBoard[partitionLocal[1]][partitionLocal[0]] = "X";
	}
	else
	{
		base_image.src = "../assets/nought.png";
		gameBoard[partitionLocal[1]][partitionLocal[0]] = "O";
	}

	let startX = gridPadding + imagePad;
	let startY = gridPadding + imagePad;
	let lengthX = 1 + width - imagePad * 2;
	let heightY = 1 + height - imagePad * 2;

	startX += width * partitionLocal[0];
	startY += height * partitionLocal[1];

	base_image.onload = function ()
	{
		context.drawImage(base_image, startX, startY, lengthX, heightY);
	}
}

let oldPartition = partition;
function updateDarkOverlay() //updates the indicator of the submitted move
{
	if (chosenMove == "Unchosen")
	{
		let base_image = new Image();

		removeOldDark();

		if (playerIsCross)
		{
			base_image.src = "../assets/crossDark.png";
			//gameBoard[partitionLocal[1]][partitionLocal[0]] = "X";
		}
		else
		{
			base_image.src = "../assets/noughtDark.png";
			//gameBoard[partitionLocal[1]][partitionLocal[0]] = "O";
		}

		oldPartition = partition;

		if (insideBox && gameBoard[partition[1]][partition[0]] == -1)
		{
			drawInPartition(base_image, partition);
			
		}
		
	}
}

function removeOldDark()
{
	let base_image = new Image();
	let oldPartitionInsideBox = (oldPartition != "Outside of Box");
	
	if (oldPartition != partition && oldPartitionInsideBox && gameBoard[oldPartition[1]][oldPartition[0]] == -1) //this makes great use of short circuits
	{
		base_image.src = "../assets/emptySquare.png";
		drawInPartition(base_image, oldPartition);
	}
}

function drawInPartition(image, coords)
{
	let x = coords[0];
	let y = coords[1];

	let startX = gridPadding + imagePad;
	let startY = gridPadding + imagePad;
	let lengthX = 1 + width - imagePad * 2;
	let heightY = 1 + height - imagePad * 2;

	startX += width * x;
	startY += height * y;

	image.onload = function ()
	{
		context.drawImage(image, startX, startY, lengthX, heightY);
	}
}

function setMove()
{
	let newImage = new Image();

	if (playerIsCross)
	{
		newImage.src = "../assets/crossDark.png";
		//gameBoard[partitionLocal[1]][partitionLocal[0]] = "X";
	}
	else
	{
		newImage.src = "../assets/noughtDark.png";
		//gameBoard[partitionLocal[1]][partitionLocal[0]] = "O";
	}
	

	if (insideBox && (gameBoard[partition[1]][partition[0]] == -1))
	{
		clearChosenMove();
		drawInPartition(newImage, partition);
		chosenMove = partition;
	}
}

function clearChosenMove()
{
	if (chosenMove == "Unchosen")
	{
		return null;
	}
	if (gameBoard[chosenMove[1]][chosenMove[0]] == -1)
	{
		let replacement = new Image();
		replacement.src = "../assets/emptySquare.png";
		drawInPartition(replacement, chosenMove);
		chosenMove = ["Unchosen"];
	}
}

let counter = 0;
function rgbLight()
{
	let frequency = 0.0005;

	let red = Math.sin(frequency * counter + 0) * 127 + 128;
	let blue = Math.sin(frequency * counter + 2) * 127 + 128;
	let green = Math.sin(frequency * counter + 4) * 127 + 128;

	let rgb = "rgb(" + red + ", " + green + " ," + blue + ")";

	counter += 1;

	context.shadowBlur = 1;
	context.shadowColor = rgb;
	context.stroke();
}

function checkSides()
{
	for (let y = 0; y < 3; y++)
	{
		let sideCounter = 0;
		let topCounter = 0;
		let tempWinner = -1;

		for (let x = 0; x < 3; x++)
		{
			if (gameBoard[y][x] != -1 && gameBoard[y][0] == gameBoard[y][x])
			{
				sideCounter++;
				tempWinner = gameBoard[y][x];
			}
			if (gameBoard[x][y] != -1 && gameBoard[0][y] == gameBoard[x][y])
			{
				topCounter++;
				tempWinner = gameBoard[x][y];
			}
			if (sideCounter == 3 || topCounter == 3)
			{
				winner = tempWinner;
				return true;
			}
		}
	}
}

function checkVictoryCondition()
{
	//Checks for 3-in-a-row.

	if (checkSides())
	{
		return true;
	}

	let center = " ";
	if (gameBoard[1][1] != -1)
	{
		center = gameBoard[1][1];
	}
	if ((gameBoard[0][0] == center && gameBoard[2][2] == center) || (gameBoard[0][2] == center && gameBoard[2][0] == center))
	{
		//Expression above checks for matching corners
		winner = center;
		return true;
	}


	return false;
}

function victory()
{
	console.log("VICTORY TO " + winner);
	alert("VICTORY TO " + winner);
}





//main thread
//setInterval(rgbLight, 10);

window.addEventListener("mousemove", logPos);
window.addEventListener("mousemove", updateDarkOverlay);
window.addEventListener("click", setMove)

drawBoard();
