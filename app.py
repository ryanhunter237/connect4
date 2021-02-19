from flask import Flask, jsonify, render_template, request
import numpy as np

from game import GameState
from mcts import MCTSPlayer, RandomMover, RolloutScorer

app = Flask(__name__)

@app.route('/')
def index():
	return render_template("index.html")

@app.route("/move", methods=["POST", "GET"])
def move():
	if request.method == "POST":
		data = request.json
		board = np.array(data['board'])
		player = int(data['player'])
		col = int(data['col'])
		gamestate = GameState.from_board(board, player, col)
		move = int(mcts.move(gamestate))
		return jsonify(move)
	else:
		return render_template('index.html')

if __name__ == "__main__":
	mover = RandomMover()
	scorer = RolloutScorer(mover)
	mcts = MCTSPlayer(250, scorer, np.sqrt(2))
	app.run(debug=True)
