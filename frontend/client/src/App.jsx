import { useEffect } from "react";
import socket from "./socket";
import Lobby from "./Lobby";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id)
    })
  }, [])

  return <Lobby />
}

export default App