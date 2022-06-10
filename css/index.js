var blocks = initBlocks(8, 15);
var blocksCount = 0;

var plateX = 24;
var plateWidth = 14;
var ballX = 30;
var ballY = 3.5;
var ballVectorX = 0;
var ballVectorY = 1;

var gameStarted = false;
var gameNeedsRestart = false;

var id;
var field;
var ball;
var plate;
var score;
var hidddenInput;
var restartB;
var startTime;
var fromPause = true;
var leftButtonHeld = false;
var rightButtonHeld = false;
var mult = 3;
var lives = 0;
var livesGiven = 3;
function onLoad() {
	field = document.getElementsByClassName("field")[0];
	ball = document.getElementsByClassName("ball")[0];
	plate = document.getElementsByClassName("plate")[0];
	score = document.getElementById("score");
	hidddenInput = document.getElementById("hiddeninput");
	livesCount = document.getElementById("livesGiven");
	livesCount.innerHTML = livesGiven;
	restartB = document.getElementById("restartButton");
	restartB.style.display = "none";
	renderBlocks();
}

function gameStart() {
	window.addEventListener('keydown', onKeyDown, true);
	fromPause = true;
	id = requestAnimationFrame(moveBall)
}

function restart() {
	location.reload()
}

function pauseGame() {
	if (restartB.style.display === "none") {
		restartB.style.display = ""
	}
	mult = 0;
	cancelAnimationFrame(id)
}

function stopGame() {
	gameStarted = false;
	gameNeedsRestart = true;
	pauseGame();
	document.getElementById("gameButton").style.display = "none"

}

function mainEventTrigger(event) {
	if (!gameNeedsRestart) {
		if (gameStarted) {
			event.innerHTML = "Continue";
			gameStarted = false;
			pauseGame();
		} else {
			event.innerHTML = "Pause";
			gameStart()
			restartB.style.display = "none"
			gameStarted = true;
		}
	}
}

function initBlocks(rows, colms) {
	var blocks = new Array(rows);
	for (var i = 0; i < rows; i++) {
		blocks[i] = new Array(colms);
		for (var j = 0; j < colms; ++j) {
			blocks[i][j] = { exists: true, x: j * 4, y: 61.5 - i * 4 };

		}
	}
	return blocks;
}

function renderBlocks() {
	var colorMap = {
		1: 'red',
		2: 'orange',
		3: 'green',
		4: 'yellow'
	};
	for (var i = 0; i < blocks.length; ++i) {
		var fieldRow = document.createElement("div");
		fieldRow.className = "row";
		for (var j = 0; j < blocks[i].length; ++j) {
			var brickInRow = document.createElement("div");
			brickInRow.className = "block";
			brickInRow.style = "background-color:" + colorMap[i % 4];
			if (!blocks[i][j].exists) {
				brickInRow.className += " hidden";
			}
			blocksCount++;
			fieldRow.appendChild(brickInRow);
		}
		field.appendChild(fieldRow);
	}
}

function reRenderBlocks() {
	for (var i = 0; i < blocks.length; ++i) {
		var fieldRow = field.getElementsByClassName("row")[i];
		for (var j = 0; j < blocks[i].length; ++j) {
			if (!blocks[i][j].exists) {
				var brickInRow = fieldRow.getElementsByClassName("block")[j];
				brickInRow.className += " hidden";
			}
		}
	}
}


function onKeyDown(event) {
	if (gameStarted) {

		if (event.keyCode == 37 || event.key == "a")
			leftButtonHeld = true;

		if (event.keyCode == 39 || event.key == "d")
			rightButtonHeld = true
	}

	if (event.key == "r")
		restart()

}
function onKeyUp(event) {
	if (event.keyCode == 37 || event.key == "a") {
		leftButtonHeld = false;
	}
	if (event.keyCode == 39 || event.key == "d") {
		rightButtonHeld = false
	}
}

function moveBall(timestamp) {
	if (leftButtonHeld) {
		if (plateX >= 0.5) {
			plateX -= 0.5 * mult;
			plate.style.left = plateX + "vmin";
		}
	}

	if (rightButtonHeld) {
		if (plateX <= 45) {
			plateX += 0.5 * mult;
			plate.style.left = plateX + "vmin";
		}
	}


	ballY += 0.25 * ballVectorY * mult;
	ball.style.bottom = ballY + "vmin";
	ballX -= 0.35 * ballVectorX * mult;
	ball.style.left = ballX + "vmin";
	hitCheck();

	if (blocksCount == score.innerHTML) {
		gameResult("message-won");
		stopGame();
		return;
	}


	if (fromPause === true) {
		id = requestAnimationFrame(moveBall);
	}
}


function changeDirection(brick = null) {
	if (checkIfHitsPlate()) {
		if (ballX > plateX + plateWidth / 2 - 1.2 && ballX < plateX + plateWidth / 2) {//hits center of plate
			ballVectorX = 0;
			ballVectorY = 1;
		} else if (ballX < plateX + 4) {//left
			ballVectorX = 1;
			ballVectorY = 1;
		} else if (ballX > plateX + 4) {//right
			ballVectorX = -1;
			ballVectorY = 1;
		}
	} else if (checkIfHitsLeftWall()) {
		ballVectorX = -1;
	} else if (checkIfHitsRightWall()) {
		ballVectorX = 1;
	} else if (ballY >= 67.5) {
		ballVectorY = ballVectorY === 1 ? -1 : 1;
	} else if (ballY - 2.5 > brick.y && ballVectorX !== 0) {
		ballVectorX = ballVectorX === 1 ? -1 : 1;
	} else {
		ballVectorY = ballVectorY === 1 ? -1 : 1;
	}
}

function gameResult(string) {
	document.getElementById(string).style.display = "block"
}
function hitCheck() {
	if (lives == livesGiven) {
		gameResult("message-lose");
		document.getElementById("playername").style.display = "block"
		document.getElementById("submitbutton").style.display = "block"
		stopGame();
		return;
	}
	if (this.ballY < 0) {
		ballVectorY = 1;
		lives++;
		livesCount.innerHTML = livesGiven - lives;
	}
	for (var i = 0; i < blocks.length; ++i) {
		for (var j = 0; j < blocks[i].length; ++j) {
			if (checkIfHitsBlock(i, j)) {
				blocks[i][j].exists = false;
				changeDirection(blocks[i][j]);
				reRenderBlocks(i);
				score.innerHTML = 1 + parseInt(score.innerHTML);

				document.getElementById("hiddeninput").value = parseInt(score.innerHTML);
			} else if (checkIfHitsPlate() || checkIfHitsSideWall() || ballY >= 67.5)
				changeDirection(blocks[i][j]);


		}
	}
}

function checkIfHitsBlock(i, j) {
	return (ballX >= blocks[i][j].x
		&& ballX < blocks[i][j].x + 4
		&& ballY - 2.5 >= blocks[i][j].y
		&& ballY - 2.5 < blocks[i][j].y + 4
		&& blocks[i][j].exists);
}


function checkIfHitsPlate() {
	return (ballX >= plateX
		&& ballX <= plateX + plateWidth)
		&& ballY <= 2;
}

function checkIfHitsSideWall() {
	return checkIfHitsLeftWall() || checkIfHitsRightWall();
}

function checkIfHitsLeftWall() {
	return ballX <= 0;
}

function checkIfHitsRightWall() {
	return ballX >= 57.5;
}





