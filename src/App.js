import React, { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [activeTab, setActiveTab] = useState('game');
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [isGameActive, setIsGameActive] = useState(true);
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [settings, setSettings] = useState({ mode: 'computer', level: 'easy' });

  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8], 
    [0,3,6], [1,4,7], [2,5,8], 
    [0,4,8], [2,4,6]
  ];


  const checkWinner = (squares) => {
    for (let [a, b, c] of winPatterns) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes("") ? null : "draw";
  };

 
  const handleClick = (index) => {
    if (board[index] !== "" || !isGameActive) return;
    makeMove(index, currentPlayer);
  };

  const makeMove = (index, symbol) => {
    const newBoard = [...board];
    newBoard[index] = symbol;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      endGame(result);
    } else {
      setCurrentPlayer(symbol === "X" ? "O" : "X");
    }
  };

  const endGame = (result) => {
    setIsGameActive(false);
    if (result !== "draw") {
      setScores(prev => ({
        ...prev,
        [result === "X" ? "player" : "opponent"]: prev[result === "X" ? "player" : "opponent"] + 1
      }));
    }
  };

  
  useEffect(() => {
    if (isGameActive && settings.mode === 'computer' && currentPlayer === "O") {
      const timer = setTimeout(() => {
        const emptyIndices = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        if (randomIndex !== undefined) makeMove(randomIndex, "O");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, isGameActive, settings.mode, board]);

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setCurrentPlayer("X");
    setIsGameActive(true);
  };

  return (
    <div className="App">
      <h1>Крестики-нолики Ultimate 🎨</h1>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'game' ? 'active' : ''}`} 
          onClick={() => setActiveTab('game')}
        >Игра</button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settings')}
        >Настройки ⚙️</button>
      </div>

      {activeTab === 'game' ? (
        <div className="tab-content active">
          <div className="scoreboard">
            <div>Игрок: <span>{scores.player}</span></div>
            <div>Противник: <span>{scores.opponent}</span></div>
          </div>

          <div id="board">
            {board.map((cell, i) => (
              <div 
                key={i} 
                className={`cell ${cell}`} 
                onClick={() => handleClick(i)}
              >
                {cell}
              </div>
            ))}
          </div>

          <h2 id="status">
            {!isGameActive 
              ? (checkWinner(board) === "draw" ? "Ничья! 🤝" : `Победил ${checkWinner(board)}!`) 
              : `Ход: ${currentPlayer}`}
          </h2>
          <button id="restart" onClick={resetGame}>Новая игра</button>
        </div>
      ) : (
        <div className="tab-content active">
          <div className="settings-container">
            <label>Игра с:
              <select 
                value={settings.mode} 
                onChange={(e) => setSettings({...settings, mode: e.target.value})}
              >
                <option value="computer">Компьютером</option>
                <option value="friend">Другом</option>
              </select>
            </label>
            <button id="applySettings" onClick={() => {resetGame(); setActiveTab('game');}}>
              Применить и играть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;