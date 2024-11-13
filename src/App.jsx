import { useState } from "react";
import KnifeThrowingGame from "./components/KnifeThrowingGame";
import GameMenu from "./components/GameMenu";
import SpaceShipGame from "./components/SpaceShipGame";

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = () => setGameStarted(true);
  const handleGameOver = () => setGameStarted(false); // Volver al menú

  return (
    <div className="app">
      {!gameStarted && <GameMenu onStart={handleStart} />}
      {gameStarted && <SpaceShipGame onGameOver={handleGameOver} />}
    </div>
  );
};

export default App;