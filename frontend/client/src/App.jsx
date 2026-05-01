import { useEffect } from "react";
import socket from "./socket";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lobby from './Lobby'
import Room from './Room'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App