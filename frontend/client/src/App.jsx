import { useEffect } from "react";
import socket from "./services/socket";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lobby from "./components/Lobby/Lobby";
import Room from "./components/Room/Room";
import DrawingRoom from "./components/Room/DrawingRoom";
import Scoreboard from "./components/Scoreboard/Scoreboard";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/game/:roomId" element={<DrawingRoom />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
