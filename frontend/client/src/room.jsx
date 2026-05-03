import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import socket from './socket'
import './Room.css'
import { getOrCreateClientId } from './utils'

const MAX_PLAYERS = 8

import { AVATARS, AVATAR_COLORS } from './avatars'

function Room() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [copied, setCopied] = useState(false)
  const myClientId = getOrCreateClientId()

  useEffect(() => {
    const savedName = sessionStorage.getItem("playerName") || "Anonymous"
    const savedAvatar=sessionStorage.getItem("avatar") || '😊'
    function onConnect() {
      socket.emit("joinRoom", { roomId, playerName: savedName, clientId: myClientId, avatar: Number(sessionStorage.getItem("avatar") || 0) })
      socket.emit("getRoomData", { roomId })
    }

    if (socket.connected) {
      onConnect()
    } else {
      socket.on("connect", onConnect)
    }

    socket.on("RoomData", (room) => setRoom(room))
    socket.on("playerUpdate", (updatedRoom) => setRoom(updatedRoom))
    socket.on("turnStarted", () => navigate(`/game/${roomId}`))

    return () => {
      socket.off("connect", onConnect)
      socket.off("RoomData")
      socket.off("playerJoined")
      socket.off("turnStarted")
    }
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!room) return <div className="loading">Connecting...</div>

  const isHost = myClientId === room.hostClientId

  return (
    <div className="room-page">

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          random<span>.io</span>
        </div>
        <div className="nav-center">
          <span className="nav-link active">Lobby</span>
        </div>
        <button className="leave-btn" onClick={() => navigate('/')}>
          ← Leave Room
        </button>
      </nav>

      {/* Background doodles */}
      <div className="doodles" aria-hidden="true">
        <span className="d d1">✏️</span>
        <span className="d d2">⭐</span>
        <span className="d d3">👑</span>
        <span className="d d4">💙</span>
        <span className="d d5">💚</span>
        <span className="d d6">🩷</span>
      </div>

      {/* Main */}
      <main className="room-main">
        <div className="room-card">

          {/* Top: Room ID + count */}
          <div className="card-top">
            <div className="room-id-section">
              <p className="section-label">ROOM ID</p>
              <div className="room-id-row">
                <h1 className="room-id-text">{roomId}</h1>
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? '✅' : '📋'}
                </button>
              </div>
              <p className="room-sub">Share this code with your friends!</p>
            </div>

            <div className="card-divider" />

            <div className="count-section">
              <div className="count-row">
                <span className="count-icon">👥</span>
                <span className="count-text">
                  <strong>{room.players.length}</strong> / {MAX_PLAYERS} players joined
                </span>
              </div>
              <p className="count-sub">Game starts when the host clicks Start.</p>
            </div>
          </div>

          {/* Players grid */}
          <div className="players-section">
            <p className="section-label blue">PLAYERS</p>
            <div className="players-grid">
              {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
                const player = room.players[i]
                if (player) {
                  return (
                    <div key={player.clientId} className="player-card">
                      {player.clientId === room.hostClientId && (
                        <span className="host-badge">HOST</span>
                      )}
                     <div className="avatar" style={{ 
                      background: AVATAR_COLORS[player.avatar] }}>
                        {AVATARS[player.avatar]}
                      </div>
                      <p className="player-name">{player.name}</p>
                    </div>
                  )
                } else {
                  return (
                    <div key={i} className="player-card empty">
                      <div className="avatar empty-avatar">👤</div>
                      <p className="player-name empty-name">Waiting...</p>
                    </div>
                  )
                }
              })}
            </div>
          </div>

          {/* Bottom: Tip + Start */}
          <div className="card-bottom">
            <div className="tip-box">
              <p className="tip-title">💡 TIP</p>
              <p className="tip-text">More players = more fun! Invite your friends and start drawing.</p>
            </div>

            <div className="start-section">
              {isHost ? (
                <button className="start-btn" onClick={() => socket.emit("startGame")}>
                  ▶ Start Game
                </button>
              ) : (
                <button className="start-btn disabled" disabled>
                  ▶ Start Game
                </button>
              )}
              <p className="host-note">🔒 Only the host can start the game</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Room
