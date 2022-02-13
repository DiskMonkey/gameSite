let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

setInterval(updateSpeed, 10)

let timerID = [];
timerID[0] = setInterval(draw, 1);

let i = 0;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    x += Math.cos(i);
    y += -Math.sin(i);

    i = i + 0.01;
}

function endAnimation()
{
    console.log("Removed Timer");
    clearInterval(timerID.pop());
}

function startAnimation()
{
    console.log("Added Timer");
    timerID.push(setInterval(draw, 1));
}

function updateSpeed()
{
    document.getElementById("p1").innerHTML = "Speed: " + timerID.length;
}



