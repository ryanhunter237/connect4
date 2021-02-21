let nRows = 6;
let nCols = 7;
let inGame = false;
let newGameButton;
let board;
let winner = -1;
let lastMove = -1;

class Board {
  constructor() {
    this.pieces = [];
    for (let i = 0; i < nRows; i++) {
      this.pieces[i] = [];
      for (let j = 0; j < nCols; j++) {
        this.pieces[i][j] = 0;
      }
    }
    this.player = 1;
  }

  addPiece(col) {
    if (this.pieces[0][col] != 0) {
      return;
    }
    for (let j = nRows - 1; j >= 0; j--) {
      if (this.pieces[j][col] == 0) {
        this.pieces[j][col] = this.player;
        this.updateWinner(j, col);
        if (winner != -1) {
          inGame = false;
          display.showNewGameButton();
        }
        this.player = 1 + (this.player % 2);
        lastMove = col;
        return;
      }
    }
  }

  boardFull() {
    for (let j = 0; j < nCols; j++) {
      if (this.pieces[0][j] == 0) {
        return false;
      }
    }
    return true;
  }

  updateWinner(row, col) {
    // row, col was the last move played
    if (
      this.connectedCol(row, col) ||
      this.connectedRow(row, col) ||
      this.connectedNegDiag(row, col) ||
      this.connectedPosDiag(row, col)
    ) {
      winner = this.pieces[row][col];
    } else if (this.boardFull()) {
      winner = 0; // for a tie
    } else {
      winner = -1; // game not over
    }
  }

  connectedCol(row, col) {
    let piece = this.pieces[row][col];
    let nConnected = 1;
    let i = row + 1;
    while (i < nRows) {
      if (this.pieces[i][col] == piece) {
        nConnected++;
        i++;
      } else {
        break;
      }
    }
    return (nConnected >= 4);
  }

  connectedRow(row, col) {
    let piece = this.pieces[row][col];
    let nConnected = 1;
    let j = col + 1;
    while (j < nCols) {
      if (this.pieces[row][j] == piece) {
        nConnected++;
        j++;
      } else {
        break;
      }
    }
    j = col - 1;
    while (j >= 0) {
      if (this.pieces[row][j] == piece) {
        nConnected++;
        j--;
      } else {
        break;
      }
    }
    return (nConnected >= 4);
  }

  connectedNegDiag(row, col) {
    let piece = this.pieces[row][col];
    let nConnected = 1;
    let i = row + 1;
    let j = col + 1;
    while ((i < nRows) && (j < nCols)) {
      if (this.pieces[i][j] == piece) {
        nConnected++;
        i++;
        j++;
      } else {
        break;
      }
    }
    i = row - 1;
    j = col - 1;
    while ((i >= 0) && (j >= 0)) {
      if (this.pieces[i][j] == piece) {
        nConnected++;
        i--;
        j--;
      } else {
        break;
      }
    }
    return (nConnected >= 4);
  }

  connectedPosDiag(row, col) {
    let piece = this.pieces[row][col];
    let nConnected = 1;
    let i = row + 1;
    let j = col - 1;
    while ((i < nRows) && (j >= 0)) {
      if (this.pieces[i][j] == piece) {
        nConnected++;
        i++;
        j--;
      } else {
        break;
      }
    }
    i = row - 1;
    j = col + 1;
    while ((i >= 0) && (j < nCols)) {
      if (this.pieces[i][j] == piece) {
        nConnected++;
        i--;
        j++;
      } else {
        break;
      }
    }
    return (nConnected >= 4);
  }
}

class BoardDisplay {
  constructor() {
    this.buffer = 4
    this.diam = (width - this.buffer * (nCols + 1)) / nCols;

    let offset = this.buffer + this.diam / 2;
    let increment = this.buffer + this.diam

    this.xCenters = [];
    for (let i = 0; i < nCols; i++) {
      this.xCenters[i] = offset + i * increment;
    }
    this.yCenters = [];
    for (let i = 0; i < nRows; i++) {
      this.yCenters[i] = offset + i * increment;
    }
    let yShift = height - this.yCenters[nRows - 1] - offset;
    for (let i = 0; i < nRows; i++) {
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

  showBoard(board) {
    background(0, 0, 150);
    noStroke();

    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
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
    fill(255, 80)
    rect(
      this.buffer/2, 
      this.buffer/2, width - this.buffer, 
      this.diam + this.buffer
    );
    fill(0);
    noStroke();
    textStyle(BOLD);
    textAlign(CENTER);
    textSize(32);
    if (winner == 0) {
      text("Tie game", width/2, 45);
    } if ((winner == 1) || (winner == 2)) {
      text("Player " + winner + " wins", width/2, 45);
    }
  }
  
  showNewGameButton() {  
    newGameButton = createButton('New Game');
    newGameButton.style('font-size', '32px');
    newGameButton.style('font-weight', 'bold');
    newGameButton.style('background-color', color(0,250,100,170));
    newGameButton.size(200);
    newGameButton.position(width/2 - 100, 0.445 * height);
    newGameButton.mousePressed(startNewGame);
  }

  columnFromPos(x, y) {
    for (let i = 0; i < nCols; i++) {
      if (abs(x - this.xCenters[i]) <= this.diam / 2) {
        return i;
      }
    }
    return -1;
  }
}

function startNewGame() {
  inGame = true;
  board = new Board();
  display.showBoard(board)
  newGameButton.hide()
}

function makeMove() {
  let col = display.columnFromPos(mouseX, mouseY);
  if ((inGame) && (board.player == 1) && (col != -1)) {
    board.addPiece(col);
    display.showBoard(board);
  } 
}

function makeComputerMove() {
  var gamestate = {
    "board" : board.pieces,
    "player" : board.player,
    "col" : lastMove
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
      display.showBoard(board);
      loop();
    }
  ); 
}

function setup() {
  cnv = createCanvas(400, 400);
  cnv.mousePressed(makeMove);
  board = new Board();
  display = new BoardDisplay();
  display.showNewGameButton();
}

function draw() {
  if (inGame) {
    if (board.player == 1) {
      let col = display.columnFromPos(mouseX, mouseY);
      display.showBoard(board);
      display.showMoveChoice(col);
    } else {
      makeComputerMove();
    }
  } else {
    display.showBoard(board);
    display.showWinner(winner);
  }
}
