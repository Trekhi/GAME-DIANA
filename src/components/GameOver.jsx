import ReactDOM from "react-dom";
import {useEffect, useState } from "react";
import '../styles/GameOver.css'

const GameOver = ({ score, onRestart,playerName,gameHistory,onDeleteRecord }) => {
  const [audioPlayed, setAudioPlayed] = useState(false);  // Estado para controlar si el sonido ya se ha reproducido

  // Usar useEffect para reproducir el sonido solo cuando el juego termina
  useEffect(() => {
    if (!audioPlayed) {
      const audio = new Audio("/sounds/game-over-1-gameover.mp3");  // Reemplaza con la ruta de tu archivo de sonido
      audio.play();
      setAudioPlayed(true);  // Cambiar el estado para evitar que se reproduzca nuevamente
    }
  }, [audioPlayed]);  // Se ejecuta solo una vez cuando 'audioPlayed' cambia a true

  console.log("Rendering GameOver with score:", score);
  return GameOver ? ReactDOM.createPortal(
    <div className="game-over">
      <h1>Game Over</h1>
      <p>Your Score: {score}</p>
      <p>sd: {playerName}</p>

      <h2>Game History</h2>
      <ul>
        {gameHistory.map((record, index) => (
          <li key={index}>
            <strong>{record.name}</strong> - Score: {record.score} - Date: {record.date}
            <button onClick={() => onDeleteRecord(index)} style={{ marginLeft: "10px", color: "white" }}>
            Delete
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onRestart}>Play Again</button>
    </div>,
    document.body
  ):null;
};

export default GameOver;