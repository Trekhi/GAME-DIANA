import { useState,useEffect}  from "react";
import GameMenu from "./components/GameMenu";
import SpaceShipGame from "./components/SpaceShipGame";
import GameOver from "./components/GameOver";

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState(""); // Nuevo estado para el nombre
  const [gameHistory, setGameHistory] = useState([]);


    // Cargar historial del localStorage al iniciar
    useEffect(() => {
      const storedHistory = localStorage.getItem("gameHistory");
      if (storedHistory) {
        setGameHistory(JSON.parse(storedHistory));
      }
    }, []);
  
    // Guardar nuevo registro en localStorage
    const saveGameToHistory = (name, score) => {
      const newRecord = { name, score, date: new Date().toLocaleString() };
      const updatedHistory = [...gameHistory, newRecord];
      setGameHistory(updatedHistory);
      localStorage.setItem("gameHistory", JSON.stringify(updatedHistory));
    };

    const handleDeleteRecord = (index) => {
      // Filtrar el registro que deseas eliminar
      const updatedHistory = gameHistory.filter((_, i) => i !== index);
    
      // Actualizar el estado y el localStorage
      setGameHistory(updatedHistory);
      localStorage.setItem("gameHistory", JSON.stringify(updatedHistory));
    };
    
                           

  const handleStart = (name) => {
    setPlayerName(name); // Guarda el nombre del usuario                       
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
      saveGameToHistory(playerName, finalScore); // Guarda el resultado

      
    }
  };

  const handleRestart = () => {
    setGameOver(false);
    setGameStarted(false);
    setScore(0); // Reinicia todo
    setPlayerName(""); // Reinicia el nombre si es necesario

  };

  return (
    <div className="app">
      {!gameStarted && !gameOver && <GameMenu onStart={handleStart} />}

      {gameStarted && <SpaceShipGame onGameOver={handleGameOver} />}

      {gameOver && <GameOver score={score} playerName={playerName} gameHistory={gameHistory} onDeleteRecord={handleDeleteRecord} onRestart={handleRestart} />}
      </div>
  );
};


export default App;