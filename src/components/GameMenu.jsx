import React, { useState } from "react";
import "../styles/GameMenu.css";

function GameMenu({ onStart }) {
  const [playerName, setPlayerName] = useState("");

  const handleStartClick = () => {
    if (playerName.trim() === "") {
      alert("Por favor ingresa tu nombre antes de comenzar.");
      return;
    }
    onStart(playerName); // Pasamos el nombre al manejador
  };

  return (
    <div className="game-menu">
      <h1>Juego de Diana</h1>
      <p>Controles:</p>
      <p>Mouse - Mover</p>
      <p>Click Izquierdo - Lanzar cuchillo</p>
      <input
        type="text"
        placeholder="Ingresa tu nombre"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="name-input"
      />
      <button className="start-button" onClick={handleStartClick}>
        Comenzar Juego
      </button>
      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        Haz click en comenzar, luego en la pantalla para habilitar el control del mouse.
      </p>
    </div>
  );
}

export default GameMenu;
