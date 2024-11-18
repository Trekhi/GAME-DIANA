import { useState } from "react";
import GameMenu from "./components/GameMenu";
import SpaceShipGame from "./components/SpaceShipGame";
import GameOver from "./components/GameOver";

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const handleStart = () => {
    setGameStarted(true);
    setGameOver(false); // Asegura que el estado esté limpio
    setScore(0); // Reinicia el puntaje
  };

  const handleGameOver = (finalScore) => {
    if (!gameOver) { // Evita conflictos
      console.log("Game over in App with score:", finalScore); // Debug
      setScore(finalScore);
      setGameStarted(false);
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setGameOver(false);
    setGameStarted(false);
    setScore(0); // Reinicia todo
  };

  return (
    <div className="app">
      {!gameStarted && !gameOver && <GameMenu onStart={handleStart} />}

      {gameStarted && <SpaceShipGame onGameOver={handleGameOver} />}

      {gameOver && <GameOver score={score} onRestart={handleRestart} />}
      </div>
  );
};


export default App;