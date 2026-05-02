import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import socket from './socket'
import './Room.css'
import { getOrCreateClientId } from './utils'

const MAX_PLAYERS = 8

function Room() {

  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const myClientId = getOrCreateClientId()

  useEffect(() => {
    const savedName = sessionStorage.getItem("playerName") || "Anonymous";
    function onConnect() {
      socket.emit("joinRoom", { roomId, playerName: savedName, clientId: myClientId })
      socket.emit("getRoomData", { roomId })
    }

    // if already connected, run immediately
    // if not, wait for connection first
    if (socket.connected) {
      onConnect()
    } else {
      socket.on("connect", onConnect)
    }

    socket.on("RoomData", (room) => setRoom(room))
    socket.on("playerUpdate", (updatedRoom) => setRoom(updatedRoom));

    socket.on("turnStarted", () => {
      navigate(`/game/${roomId}`)
    })

    return () => {
      socket.off("connect", onConnect)
      socket.off("RoomData")
      socket.off("playerJoined")
      socket.off("turnStarted")
    }
  }, [])

  if (!room) return <div>Loading...</div>

  const isHost = myClientId === room.hostClientId;

  return (

    <div className="room-page">
      <nav className="navbar">
        <div className="navbar-logo">random<span>.io</span></div>
        <button className="leave-btn" onClick={() => navigate('/')}>⬅ Leave Room</button>
      </nav>

      <div className="room-container">
        <div className="room-card">
          <div className="sidebar">
            <div className="sidebar-top">
              <div className="room-id-box">
                <p className="label">ROOM ID</p>
                <h2>{roomId}</h2>
                <p>Share this code with your friends!</p>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(roomId)}>⧉ Copy</button>
              </div>

              <div className="players-section">
                <p className="label">PLAYERS ({room.players.length}/{MAX_PLAYERS})</p>
                {room.players.map((player, i) => (
                  <div key={player.clientId} className="player-row">
                    <span className="player-name">{player.name}</span>
                    {player.id === room.hostId && <span className="host-badge">HOST</span>}
                  </div>
                ))}
                {Array.from({ length: MAX_PLAYERS - room.players.length }).map((_, i) => (
                  <div key={i} className="empty-slot">
                    👤 Waiting for player...
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-bottom">
              {isHost && (
                <button className="start-btn" onClick={() => socket.emit("startGame")}>
                  ▶ Start Game
                </button>
              )}
              <p className="host-note">🔒 Only the host can start the game</p>
            </div>
          </div>

          <div className="main-area">
            <h2>Waiting for more players...</h2>
            <p>The game will start once the host clicks Start Game.</p>
            <div className="tip-box">
              <p className="tip-title">💡 TIP</p>
              <p>More players = more fun!<br />Invite your friends and start drawing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room