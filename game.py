# connect four game module. 
# The board is a matrix where 1 plays first, 2 plays second, and 0 is empty
# The function play_game starts a game between two players (human or computer).  
import numpy as np

NROWS = 6
NCOLS = 7
NCONNECT = 4

def has_row_connection(board, row, col):
	# Returns a boolean saying whether there are nconnect many of the same number in the
	# row of board through the position (row, col)
	count = 1
	player = board[row, col]
	for i in range(col+1, NCOLS):
		if board[row, i] == player:
			count += 1
		else:
			break
	for i in range(col-1, -1, -1):
		if board[row, i] == player:
			count += 1
		else:
			break
	return count >= NCONNECT

def has_col_connection(board, row, col):
	# Returns a boolean saying whether there are nconnect many of the same number in the
	# column of board through the position (row, col)
	if row > NROWS-NCONNECT:
		return False
	player = board[row, col]
	for i in range(row+1, row+NCONNECT):
		if board[i, col] != player:
			return False
	return True

def has_pos_diag_connection(board, row, col):
	# Returns a boolean saying whether there are nconnect many of the same number in the
	# positive slope diagonal of board through the position (row, col)
	count = 1
	player = board[row, col]
	i = row-1
	j = col+1
	while i >= 0 and j < NCOLS:
		if board[i, j] == player:
			count += 1
			i -= 1
			j += 1
		else:
			break
	i = row+1
	j = col-1
	while i < NROWS and j >= 0:
		if board[i, j] == player:
			count += 1
			i += 1
			j -= 1
		else:
			break
	return count >= NCONNECT

def has_neg_diag_connection(board, row, col):
	# Returns a boolean saying whether there are nconnect many of the same number in the
	# negative slope diagonal of board through the position (row, col)
	count = 1
	player = board[row, col]
	i = row+1
	j = col+1
	while i < NROWS and j < NCOLS:
		if board[i, j] == player:
			count += 1
			i += 1
			j += 1
		else:
			break
	i = row-1
	j = col-1
	while i >= 0 and j >= 0:
		if board[i, j] == player:
			count += 1
			i -= 1
			j -= 1
		else:
			break
	return count >= NCONNECT

def has_connection(board, row, col):
	# Returns a boolean saying if there are nconnect many of the same number in the
	# row, column, or diagonals of board through the position (row, col)
	return has_row_connection(board, row, col) \
		or has_col_connection(board, row, col) \
		or has_pos_diag_connection(board, row, col) \
		or has_neg_diag_connection(board, row, col)

def game_status(board, row, col):
	# (row, col) is the last move played
	# Returns -1 for game not over
	# Returns 0 for game over tie
	# Returns 1 or 2 for game over, winning player
	if has_connection(board, row, col):
		return board[row, col]
	elif 0 in board[0,:]:
		return -1
	else:
		return 0

class GameState:
	# The current state of the game.  Contains the current board, and the player whose turn it is.
	# status is -1 for game not over, 0 for game  over tie, and 1,2 for game over winner
	def __init__(self, board, player, status):
		self.board = board
		self.player = player
		self.status = status

	@classmethod
	def empty(cls):
		# Returns an empty GameState for the start of the game.  
		return cls(np.zeros((NROWS, NCOLS)), 1, -1)

	@classmethod
	def from_board(cls, board, player, col):
		"""Create the GameState from the board, the current player, 
		and the column of the last move played
		"""
		row = np.min(np.argwhere(board[:,col] != 0))
		status = game_status(board, row, col)
		return cls(board, player, status)

	def move(self, col):
		# Returns a new GameState after a move is played in col.
		board = np.copy(self.board)
		row = self.row_for_move(col)
		board[row, col] = self.player
		status = game_status(board, row, col)
		player = self.next_player()
		return GameState(board, player, status)

	def inplace_move(self, col):
		# Update the game state with a move played in col. 
		# Used for rollouts to avoid making copies of the board.
		# Might not be necessary.  Should test time savings of this.
		row = self.row_for_move(col)
		self.board[row, col] = self.player
		self.status = game_status(self.board, row, col)
		self.player = self.next_player()

	def next_player(self):
		return 1 + (self.player % 2)

	def open_cols(self):
		# Returns a list of ints of the columns which can be played in.  
		return list(np.argwhere(self.board[0,:] == 0).reshape(-1))

	def row_for_move(self, col):
		# Returns the last open row in a given column.  
		# This is the row where a move played in column would end up.
		return np.max(np.argwhere(self.board[:,col] == 0))

	def copy(self):
		return GameState(np.copy(self.board), self.player, self.status)
