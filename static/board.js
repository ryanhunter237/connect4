class Board {
  constructor(nRows, nCols) {
    this.nRows = nRows
    this.nCols = nCols
    this.pieces = [];
    for (let i = 0; i < this.nRows; i++) {
      this.pieces[i] = [];
      for (let j = 0; j < this.nCols; j++) {
        this.pieces[i][j] = 0;
      }
    }
    this.player = 1; // current player whose move it is
    this.lastMove = -1; // column of the last move played for either player. 
    this.status = -1; // -1 = no winner, 0 = tie, 1/2 = player 1/2 wins
  }

  addPiece(col) {
    if (this.pieces[0][col] != 0) {
      return;
    }
    for (let j = this.nRows - 1; j >= 0; j--) {
      if (this.pieces[j][col] == 0) {
        this.pieces[j][col] = this.player;
        this.lastMove = col;
        this.updateStatus(j, col);
        this.player = 1 + (this.player % 2);
        return;
      }
    }
  }

  boardFull() {
    for (let j = 0; j < this.nCols; j++) {
      if (this.pieces[0][j] == 0) {
        return false;
      }
    }
    return true;
  }

  updateStatus(row, col) {
    // row, col was the last move played
    if (
      this.connectedCol(row, col) ||
      this.connectedRow(row, col) ||
      this.connectedNegDiag(row, col) ||
      this.connectedPosDiag(row, col)
    ) {
      this.status = this.pieces[row][col];
    } else if (this.boardFull()) {
      this.status = 0; // for a tie
    } else {
      this.status = -1; // game not over
    }
  }

  connectedCol(row, col) {
    let piece = this.pieces[row][col];
    let nConnected = 1;
    let i = row + 1;
    while (i < this.nRows) {
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
    while (j < this.nCols) {
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
    while ((i < this.nRows) && (j < this.nCols)) {
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
    while ((i < this.nRows) && (j >= 0)) {
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
    while ((i >= 0) && (j < this.nCols)) {
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