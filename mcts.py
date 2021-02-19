from functools import partialmethod

import numpy as np

class Node:
    # A Node in the Monte Carlo tree search.  Contains the GameState, parent node, list of children nodes, 
    # the node score which is updated by backpropagation after a rollout, the node visit count, and
    # a list the columns which have not been used to create a child node yet.
    def __init__(self, parent, gamestate):
        self.gamestate = gamestate
        self.parent = parent
        self.children = []
        self.score = 0
        self.visit_count = 0
        self.unexplored_cols = list(np.random.permutation(gamestate.open_cols()))
        #TODO: ordering the cols shouldn't be done by the constructor

    @classmethod
    def root(cls, gamestate):
        # Returns a root node with no parent
        return cls(None, gamestate)

    def expand(self):
        """
        Expand this node by adding a child node with a move from the unexplored columns.
        Remove the column from the unexplored columns after the child node has been added
        Return the child node that was just created.
        """
        if self.unexplored_cols:
            col = self.unexplored_cols.pop()
            gamestate = self.gamestate.move(col)
            child = Node(self, gamestate)
            self.children.append(child)
            return child

    def upper_conf_bound(self, child, explore_rate):
        ucb = (-child.score / child.visit_count)
        ucb += explore_rate * np.sqrt(np.log(self.visit_count) / child.visit_count)
        return ucb

    def best_child(self, explore_rate):
        # Returns the child node which has the greatest Upper Confidence Bound
        # Want to choose the child with a lower score, meaning it's the worst position for your opponent
        # That's why there's a negative sign in front of node.score
        max_ucb = -10
        for child in self.children:
            ucb = self.upper_conf_bound(child, explore_rate)
            if ucb > max_ucb:
                best_node = child
                max_ucb = ucb
        return best_node

class RandomMover:
    def move(self, gamestate):
        # Return column of a random legal move for the gamestate
        return np.random.choice(gamestate.open_cols())

class RolloutScorer:
    # A class which scores gamestates based on a rollout.
    # A mover class is used to make the moves in the rollout.
    # The score is in [-1,0,1] corresponding to the winner of the rollout.
    def __init__(self, mover):
        self.mover = mover

    def score(self, gamestate):
        trial_game = gamestate.copy()
        while trial_game.status == -1:
            col = self.mover.move(trial_game)
            trial_game.inplace_move(col)
        return trial_game.status

class MCTSPlayer:
    # A class which chooses moves based on the Monte Carlo Tree Search algorithm.
    # The method self.move(gamestate) returns the row and column of the move chosen by the algorithm
    # The algorithm uses a scorer, which is a class with a score(board_state) method, to evaluate board states
    # Playouts if the number of nodes to explore during the tree search.
    def __init__(self, playouts, scorer, explore_rate):
        self.playouts = playouts
        self.scorer = scorer
        self.explore_rate = explore_rate

    def traverse(self, node):
        # Traverse the tree from the current node.  
        # Stop if this node has unexplored columns. Expand one of the children and return the child node.
        # Stop if this node has a game over GameState.  Return this node.
        # Otherwise, traverse to the node which is the best child of this node.
        if len(node.unexplored_cols) > 0:
            return node.expand()
        elif node.gamestate.status != -1:
            return node
        else:
            return self.traverse(node.best_child(self.explore_rate))

    @staticmethod
    def backpropagate(node, leaf_result):
        # Update the scores and visit counts of all ancestors of this node 
        # using the result from the leaf node.
        # the node score is update by -1, 0, or 1
        # (-1,0,1) if the board position leades to a (loss, tie, win) for the current player
        node.visit_count += 1
        if leaf_result != 0:
            if leaf_result == node.gamestate.player:
                node.score += 1
            else:
                node.score -= 1
        if node.parent:
            MCTSPlayer.backpropagate(node.parent, leaf_result)

    def tree_search(self, root):
        # Perform the tree search algorithm from the root node for playouts many steps.
        for _ in range(self.playouts):
            leaf_node = self.traverse(root)
            result = self.scorer.score(leaf_node.gamestate)
            MCTSPlayer.backpropagate(leaf_node, result)

    @staticmethod
    def final_move_choice(root):
        # Return the (row, col) of the best move from the root node after the tree search has been performed.
        # The child of the root node with the highest visit count is chosen.
        for child in root.children:
            col = np.where(root.gamestate.board - child.gamestate.board)[1][0]
            print("col = {}".format(col))
            print("score = {}".format(child.score))
            print("visit count = {}".format(child.visit_count))

        max_visit_node = max(root.children, key=lambda node : node.visit_count)
        col = np.where(root.gamestate.board - max_visit_node.gamestate.board)[1][0]
        return col

    def move(self, gamestate):
        # Return the (row, col) of the best move from the current game state found by
        # the MCTS algorithm executed with playouts many steps.
        root = Node.root(gamestate)
        self.tree_search(root)
        return MCTSPlayer.final_move_choice(root)