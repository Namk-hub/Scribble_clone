import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import socket from './socket'
import { getOrCreateClientId } from './utils'
import './drawingRoom.css'

const COLORS = ['#1a1a1a', '#e63946', '#f4a261', '#f9c74f', '#4caf50', '#4361ee', '#9b5de5', '#f72585', '#8d6748', '#adb5bd']
const AVATARS = ['🐱', '🐶', '🐸', '🐼', '🐯', '🐨']

function DrawingRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const myClientId = getOrCreateClientId()

  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [guess, setGuess] = useState('')
  const [wordChoices, setWordChoices] = useState([])
  const [currentWord, setCurrentWord] = useState(null)
  const [phase, setPhase] = useState('waiting') // waiting | picking | drawing
  const [color, setColor] = useState('#1a1a1a')

  // Drawing state refs (not state — no re-render needed)
  const isDrawing = useRef(false)
  const lastX = useRef(0)
  const lastY = useRef(0)

  // ─── Socket Setup ───────────────────────────────────────────────
  useEffect(() => {
    console.log("DrawingRoom mounted!")
    console.log("socket connected?", socket.connected)
    const savedName = sessionStorage.getItem('playerName') || 'Anonymous'
    const savedAvatar = sessionStorage.getItem('avatar') || '0'

    function onConnect() {
      console.log("onConnect fired!")
      socket.emit('joinRoom', { roomId, playerName: savedName, clientId: myClientId, avatar: savedAvatar })
      socket.emit('getRoomData', { roomId, clientId: myClientId })
    }

    if (socket.connected) {
      console.log("Socket already connected, calling onConnect")
      onConnect()
    } else {
      console.log("Socket not connected, waiting for connect event")
      socket.on('connect', onConnect)
    }

    socket.on('RoomData', (room) => {
      setRoom(room);
      setPhase(room.gameState.phase);
      if (room.gameState.phase === 'picking' && room.gameState.currentDrawer === myClientId) {
        setWordChoices(room.gameState.wordChoices || [])
      }
    })
    socket.on('playerUpdate', (room) => {
      setRoom(room);
      if (room.gameState.phase) setPhase(room.gameState.phase)
    })

    socket.on('wordChoices', (list) => {
      setWordChoices(list)
      setPhase('picking')
    })

    socket.on('drawingStarted', () => {
      setPhase('drawing')
      setWordChoices([])
    })

    socket.on('wordPicked', (word) => {
      setCurrentWord(word)
    })

    socket.on('turnStarted', (msg) => {
      addMessage({ type: 'system', text: msg })
      setPhase('picking')
      setCurrentWord(null)
      setWordChoices([])
    })

    socket.on('correctGuess', ({ clientId, points }) => {
      addMessage({ type: 'correct', text: `Someone guessed correctly! +${points} pts` })
    })

    socket.on('message', (msg) => {
      addMessage({ type: 'system', text: msg })
    })

    // Receive drawing from others
    socket.on('draw', ({ x0, y0, x1, y1, color }) => {
      drawLine(x0, y0, x1, y1, color, false)
    })

    socket.on('clearCanvas', () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    })

    socket.on('error', (err) => {
      console.error("Socket error:", err)
    })

    return () => {
      socket.off('connect', onConnect)
      socket.off('RoomData')
      socket.off('playerUpdate')
      socket.off('wordChoices')
      socket.off('drawingStarted')
      socket.off('wordPicked')
      socket.off('turnStarted')
      socket.off('correctGuess')
      socket.off('message')
      socket.off('draw')
      socket.off('clearCanvas')
      socket.off('error')
    }
  }, [])

  // ─── Canvas Drawing ──────────────────────────────────────────────
  function drawLine(x0, y0, x1, y1, strokeColor, emit) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 6 // Fixed brush size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    if (emit) {
      socket.emit('draw', { x0, y0, x1, y1, color: strokeColor })
    }
  }

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  function handleMouseDown(e) {
    const isDrawer = myClientId === room?.gameState?.currentDrawer
    if (!isDrawer || phase !== 'drawing') return
    isDrawing.current = true
    const { x, y } = getPos(e, canvasRef.current)
    lastX.current = x
    lastY.current = y
  }

  function handleMouseMove(e) {
    if (!isDrawing.current) return
    const { x, y } = getPos(e, canvasRef.current)
    drawLine(lastX.current, lastY.current, x, y, color, true)
    lastX.current = x
    lastY.current = y
  }

  function handleMouseUp() {
    isDrawing.current = false
  }

  function addMessage(msg) {
    setMessages(prev => [...prev.slice(-50), { ...msg, id: Date.now() + Math.random() }])
  }

  function handleGuessSubmit(e) {
    e.preventDefault()
    if (!guess.trim()) return
    socket.emit('guess', { guess: guess.trim() })
    addMessage({ type: 'mine', text: guess.trim() })
    setGuess('')
  }

  function handlePickWord(word) {
    socket.emit('pickWord', word)
    setCurrentWord(word)
    setWordChoices([])
  }

  if (!room) return <div className="loading-screen">Connecting...</div>

  const isDrawer = myClientId === room.gameState.currentDrawer
  const drawerPlayer = room.players.find(p => p.clientId === room.gameState.currentDrawer)

  // Use local state currentWord (set when picking) or fallback to room state
  const theWord = currentWord || room.gameState.currentWord

  const wordHint = theWord
    ? (isDrawer ? theWord : theWord.split('').map((c, i) => c === ' ' ? ' ' : '_').join(' '))
    : null

  return (
    <div className="game-container">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="logo">Skribbl<span>.io</span></div>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>Lobby</button>
        </div>
        <div className="nav-icons">
          <button>🔊</button>
          <button>❓</button>
          <button>⚙️</button>
        </div>
      </nav>

      {/* ── Round Bar ── */}
      <div className="round-bar">
        <div className="round-info">
          <span className="round-label">Round {room.gameState.round || 1} of 3</span>
          <div className="timer">⏱ 01:15</div>
          <div className="progress-bar"><div className="progress-fill" /></div>
        </div>
        <div className="word-info">
          <span className="word-label">Word</span>
          <div className="word-hint">
            {wordHint || (phase === 'drawing' ? '... Loading word ...' : '---')}
          </div>
          {theWord && (
            <span className="letter-count">{theWord.length} letters</span>
          )}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="main-container">

        {/* ── Left: Players ── */}
        <aside className="sidebar">
          <div className="room-id-box">
            <p className="section-label">Room ID</p>
            <h2>{roomId}</h2>
            <button onClick={() => navigator.clipboard.writeText(roomId)}>⧉ Copy</button>
          </div>

          <div className="players-list">
            <p className="section-label">PLAYERS ({room.players.length})</p>
            {room.players.map((p) => (
              <div key={p.clientId} className={`player-row ${p.clientId === myClientId ? 'me' : ''}`}>
                <div className="avatar">{AVATARS[parseInt(p.avatar) || 0]}</div>
                <div className="player-info">
                  <span className="player-name">
                    {p.name} {p.clientId === myClientId && <span className="you-badge">YOU</span>}
                  </span>
                  <span className="player-score">{room.gameState.scores[p.clientId] || 0} pts</span>
                </div>
                {p.clientId === room.hostClientId && <span className="crown-icon">👑</span>}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Center: Canvas ── */}
        <div className="canvas-area">
          {/* Canvas */}
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={800}
              height={520}
              className="drawing-canvas"
              style={{ cursor: isDrawer && phase === 'drawing' ? 'crosshair' : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            />

            {/* Word picker overlay */}
            {phase === 'picking' && isDrawer && wordChoices.length > 0 && (
              <div className="overlay">
                <div className="word-picker-modal">
                  <h3>Choose a word to draw!</h3>
                  <div className="word-choices">
                    {wordChoices.map((w) => (
                      <button key={w} className="word-choice-btn" onClick={() => handlePickWord(w)}>{w}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Waiting overlay */}
            {phase === 'waiting' && (
              <div className="overlay">
                <div className="word-picker-modal">
                  <h3>⏳ Waiting for host to start...</h3>
                  {myClientId === room.hostClientId && (
                    <button className="start-game-btn" onClick={() => socket.emit('startGame')}>▶ Start Game</button>
                  )}
                </div>
              </div>
            )}

            {/* Picking overlay for non-drawers */}
            {phase === 'picking' && !isDrawer && (
              <div className="overlay">
                <div className="word-picker-modal">
                  <h3>✏️ {drawerPlayer?.name || 'Someone'} is picking a word...</h3>
                </div>
              </div>
            )}
          </div>

          {/* Color palette */}
          <div className="color-palette">
            <div className="color-options">
              {COLORS.map(c => (
                <button
                  key={c}
                  className={`color-btn ${color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Chat ── */}
        <aside className="chat-sidebar">
          <p className="section-label">CHAT</p>
          <div className="chat-messages">
            {messages.map(m => (
              <div key={m.id} className={`chat-message message-${m.type}`}>
                {m.type === 'system' || m.type === 'correct'
                  ? <span className="message-system">{m.text}</span>
                  : <span>{m.text}</span>
                }
              </div>
            ))}
          </div>
          <form className="guess-form" onSubmit={handleGuessSubmit}>
            <input
              className="guess-input"
              placeholder="Type your guess..."
              value={guess}
              onChange={e => setGuess(e.target.value)}
              disabled={isDrawer}
            />
            <button className="guess-submit-btn" type="submit" disabled={isDrawer}>➤</button>
          </form>
        </aside>
      </div>

      {/* ── Bottom bar ── */}
      <div className="bottom-status-bar">
        <span>👥 {room.players.length} players online</span>
        <span className="online-dot" />
      </div>
    </div>
  )
}

export default DrawingRoom;