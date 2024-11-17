import ReactDOM from "react-dom";

const GameOver = ({ score, onRestart }) => {
  console.log("Rendering GameOver with score:", score);
  return GameOver ? ReactDOM.createPortal(
    <div
      style={{
        backgroundColor: "blue",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        zIndex: 10000,
      }}
    >
      <h1>Game Over</h1>
      <p>Your Score: {score}</p>
      <button onClick={onRestart}>Play Again</button>
    </div>,
    document.body
  ):null;
};

export default GameOver;