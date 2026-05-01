// Room.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import socket from './socket'
import './Room.css'

const MAX_PLAYERS = 8

function Room() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)

  useEffect(() => {

    socket.emit("getRoomData", { roomId })
    socket.on("RoomData", (room) => setRoom(room))
    socket.on("playerJoined", (players) => {
    setRoom(prev => prev ? { ...prev, players } : prev)
    })

    return () => {
      socket.off("RoomData")
      socket.off("playerJoined")
  }
  }, [])

  if (!room) return <div>Loading...</div>

  const emptySlots = MAX_PLAYERS - room.players.length

  return (
    <div className="room-page">
      <nav className="navbar">
        <div className="navbar-logo">random<span>.io</span></div>
        <button className="leave-btn" onClick={() => navigate('/')}>⬅ Leave Room</button>
      </nav>

      <div className="room-container">
        <div className="room-card">
          <div className="sidebar">
            <div className="room-id-box">
              <p className="label">ROOM ID</p>
              <h2>{roomId}</h2>
              <p>Share this code with your friends!</p>
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(roomId)}>⧉ Copy</button>
            </div>

            <div className="players-section">
              <p className="label">PLAYERS ({room.players.length}/{MAX_PLAYERS})</p>
              {room.players.map((player, i) => (
                <div key={player.id} className="player-row">
                  <span className="player-name">{player.name}</span>
                  {player.id===room.hostId  && <span className="host-badge">HOST</span>}
                </div>
              ))}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <div key={i} className="empty-slot">
                  👤 Waiting for player...
                </div>
              ))}
            </div>

            <button className="start-btn" onClick={() => socket.emit("startGame")}>
              ▶ Start Game
            </button>
            <p className="host-note">🔒 Only the host can start the game</p>
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