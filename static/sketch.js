let inGame = false;
let board;

let newGameButton;
let levelButtons;
let level = 1;
let playerButtons;
let player = 1;

function makeNewGameButton() {
  newGameButton = createButton('New Game');
  newGameButton.style('font-size', '32px');
  newGameButton.style('font-weight', 'bold');
  newGameButton.style('background-color', color(0,250,100));
  newGameButton.size(200);
  newGameButton.position(100, 100);
  newGameButton.mousePressed(startNewGame);
}

function makeLevelButtons() {
  levelButtons = Array();
  for (let i = 0; i < 5; i++) {
    let button = createButton('Level ' + (i + 1));
    let c = color(100, 250 - 50 * i, 150);
    button.position(120, 155 + 35 * i);
    button.style('padding', '3px 7px');
    button.style('border', '2px solid');
    button.style('border-color', c);
    button.style('background-color', color(240));
    button.mousePressed(function() {
      chooseLevel(button, i+1);
    });
    levelButtons.push(button);
  }
  chooseLevel(levelButtons[0], 1);
}

function chooseLevel(selectedButton, buttonLevel) {
  level = buttonLevel
  levelButtons.forEach(function(button) {
    if (button == selectedButton) {
      let c = color(selectedButton.style('border-color'));
      //c.setAlpha(100);
      button.style('background-color', c);
    } else {
      button.style('background-color', color(240));
    }
  });
}

function makePlayerButtons() {
  playerButtons = Array();
  for (let i = 0; i < 2; i++) {
    let button = createButton("")
    button.position(230, 170 + 80*i);
    button.style('width', '50px');
    button.style('height', '50px');
    button.style('border-radius', '100%');
    button.style('border', '2px solid');
    if (i == 0) {
      button.style('border-color', color(255, 0, 0));
    } else {
      button.style('border-color', color(255, 255, 0));
    }
    button.style('background-color', color(240));
    button.mousePressed(function() {
      choosePlayer(button, i+1);
    });
    playerButtons.push(button);
  }
  choosePlayer(playerButtons[0], 1)
}

function choosePlayer(selectedButton, buttonPlayer) {
  player = buttonPlayer;
  playerButtons.forEach(function(button) {
    if (button == selectedButton) {
      let c = color(selectedButton.style('border-color'));
      //c.setAlpha(170);
      button.style('background-color', c);
    } else {
      button.style('background-color', color(240));
    }
  });
}

function hideButtons() {
  newGameButton.hide();
  levelButtons.forEach(function(button) {
    button.hide();
  })
  playerButtons.forEach(function(button) {
    button.hide();
  })
}

function showButtons() {
  newGameButton.show();
  levelButtons.forEach(function(button) {
    button.show();
  })
  playerButtons.forEach(function(button) {
    button.show();
  })
}

class BoardDisplay {
  constructor(nRows, nCols) {
    this.nCols = nCols
    this.nRows = nRows
    this.buffer = 4
    this.diam = (width - this.buffer * (this.nCols + 1)) / this.nCols;

    let offset = this.buffer + this.diam / 2;
    let increment = this.buffer + this.diam

    this.xCenters = [];
    for (let i = 0; i < this.nCols; i++) {
      this.xCenters[i] = offset + i * increment;
    }
    this.yCenters = [];
    for (let i = 0; i < this.nRows; i++) {
      this.yCenters[i] = offset + i * increment;
    }
    let yShift = height - this.yCenters[this.nRows - 1] - offset;
    for (let i = 0; i < this.nRows; i++) {
      this.yCenters[i] += yShift;
    }
    
    this.hoverYCenter = this.yCenters[0] - increment;
  }
  
  colorMap(piece, alpha=255) {
    if (piece == 0) {
      return color(255, alpha);
    }
    if (piece == 1) {
      return color(255, 0, 0, alpha);
    }
    if (piece == 2) {
      return color(255, 255, 0, alpha);
    }
  }

  showBoard() {
    background(0, 0, 150);
    noStroke();
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        fill(this.colorMap(board.pieces[i][j]));
        circle(
          this.xCenters[j],
          this.yCenters[i],
          this.diam);
      }
    }

    fill(255, 80);
    rect(
      this.buffer/2, 
      this.buffer/2, width - this.buffer, 
      this.diam + this.buffer
    );
  }

  showMoveChoice(col) { 
    if (col >= 0) {
      fill(this.colorMap(board.player, 180));
      circle(
        this.xCenters[col],
        this.hoverYCenter,
        this.diam
      );
    }
  }

  showWinner() {
    fill(80,80,150);
    rect(
      this.buffer/2, 
      this.buffer/2, width - this.buffer, 
      this.diam + this.buffer
    );
    if (board.status == -1) {
      return;
    }
    fill(0);
    noStroke();
    textStyle(BOLD);
    textAlign(CENTER);
    textSize(32);
    if (board.status == 0) {
      text("Tie game", width/2, 45);
    } else {
      text("Player " + board.status + " wins", width/2, 45);
    }
  }

  columnFromPos(x, y) {
    for (let i = 0; i < this.nCols; i++) {
      if (abs(x - this.xCenters[i]) <= this.diam / 2) {
        return i;
      }
    }
    return -1;
  }

  showBox() {
    fill(80,80,150);
    rect(90,90,220,240);
  }
}

function startNewGame() {
  inGame = true;
  board = new Board(6, 7);
  hideButtons();
  display.showBoard()
}

function makeMove() {
  let col = display.columnFromPos(mouseX, mouseY);
  if ((inGame) && (board.player == player) && (col != -1)) {
    board.addPiece(col);
    display.showBoard();
    if (board.status != -1) {
      inGame = false
      showButtons();
    }
  }
}

function makeComputerMove() {
  var gamestate = {
    "board" : board.pieces,
    "player" : board.player,
    "col" : board.lastMove,
    "level" : level
  };
  noLoop();
  $.ajax({
    url: "/move",
    type: "POST",
    data: JSON.stringify(gamestate),
    contentType:"application/json; charset=utf-8",
    }
  ).done(
    function(col) {
      board.addPiece(col);
      display.showBoard();
      if (board.status != -1) {
        inGame = false
        showButtons();
      }
      loop();
    }
  ); 
}

function setup() {
  cnv = createCanvas(400, 400);
  cnv.mousePressed(makeMove);
  board = new Board(6, 7);
  display = new BoardDisplay(6, 7);
  display.showBoard();
  makeNewGameButton();
  makeLevelButtons();
  makePlayerButtons();
}

function draw() {
  if (inGame) {
    if (board.player == player) {
      let col = display.columnFromPos(mouseX, mouseY);
      display.showBoard();
      display.showMoveChoice(col);
    } else {
      makeComputerMove();
    }
  } else {
    display.showBoard();
    display.showBox();
    display.showWinner();
  }
}