import React, { useState } from "react";

function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    <button
      className={`square ${isWinningSquare ? "winning-square" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const winnerInfo = calculateWinner(squares);
  let status;
  if (winnerInfo) {
    status = "Winner: " + winnerInfo.winner;
  } else if (squares.every((square) => square !== null)) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  function renderSquare(i) {
    const isWinningSquare = winnerInfo && winnerInfo.winningSquares.includes(i);
    return (
      <Square
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        key={i}
        isWinningSquare={isWinningSquare}
      />
    );
  }

  function handleClick(i) {
    if (squares[i] || winnerInfo) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  return (
    <>
      <div className="status">{status}</div>
      {[0, 1, 2].map((row) => (
        <div className="board-row" key={row}>
          {[0, 1, 2].map((col) => renderSquare(row * 3 + col))}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [sortAsc, setSortAsc] = useState(true); // Add this line
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setXIsNext(nextMove % 2 === 0);
  }

  const winnerInfo = calculateWinner(currentSquares);

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      const [row, col] = findRowAndCol(history[move - 1], squares);
      description = `Go to move #${move} (${row}, ${col})`;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  const toggleSortOrder = () => {
    setHistory(sortAsc ? history.reverse() : [...history].reverse());
    setSortAsc(!sortAsc);
  };

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <div>
          <button onClick={toggleSortOrder}>
            {sortAsc ? "Sort Descending" : "Sort Ascending"}
          </button>
        </div>
        <div>You are at move #{currentMove}</div>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningSquares: [a, b, c],
      };
    }
  }
  return null;
}

function findRowAndCol(prevSquares, currSquares) {
  let changedIndex;
  for (let i = 0; i < prevSquares.length; i++) {
    if (prevSquares[i] !== currSquares[i]) {
      changedIndex = i;
      break;
    }
  }
  const row = Math.floor(changedIndex / 3) + 1;
  const col = (changedIndex % 3) + 1;
  return [row, col];
}
