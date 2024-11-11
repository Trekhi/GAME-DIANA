import React from 'react';
import '../styles/GameMenu.css'

function GameMenu({ onStart }) {
  return (
    <div className="game-menu">
      <h1>Juego de diana</h1>
      <p>Controls:</p>
      <p>Mouse - Move</p>
      <p>Click Izquierdo - Lanzar cuchillo</p>
      <button className="start-button" onClick={onStart}>
        Start Game
      </button>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        Click to start, then click again to enable mouse control
      </p>
    </div>
  );
}

export default GameMenu;