from flask import Flask, jsonify, render_template, request
import numpy as np

from game import GameState
from mcts import MCTSPlayer, RandomMover, RolloutScorer

app = Flask(__name__)

level2playouts = {1:125, 2:250, 3:500, 4:1000, 5:2000}

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
		level = int(data['level'])
		gamestate = GameState.from_board(board, player, col)
		ai = get_ai(playouts=level2playouts[level])
		move = int(ai.move(gamestate))
		return jsonify(move)
	else:
		return render_template('index.html')


def get_ai(playouts=150):
	mover = RandomMover()
	scorer = RolloutScorer(mover)
	return MCTSPlayer(playouts, scorer, np.sqrt(2))

if __name__ == "__main__":
	app.run(debug=True)
