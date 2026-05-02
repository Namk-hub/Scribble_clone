import { useEffect } from "react";
import socket from "./socket";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lobby from './lobby'
import Room from './room'
import DrawingRoom from './drawingRoom'

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id)
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/game/:roomId" element={<DrawingRoom />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App