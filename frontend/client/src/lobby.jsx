import './Lobby.css'
import { useEffect,useState } from "react";
import socket from './socket'
import { useNavigate } from 'react-router-dom'
import { getOrCreateClientId } from './utils'
import { AVATARS } from './avatars'


function Lobby() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(0)
 
  
  useEffect(() => {
    socket.on("created successfully", (room) => {
      navigate(`/room/${room.id}`)
    })
    socket.on("joinedRoom", (room) => {
    navigate(`/room/${room.id}`)
    })

    return () => {
      socket.off("created successfully")
      socket.off("joinedRoom")
    }
  }, [])


  function handleCreate() {
  const clientId = getOrCreateClientId()
  sessionStorage.setItem("playerName", playerName)
  sessionStorage.setItem("avatar", selectedAvatar)
  console.log("emitting createRoom", playerName)
  socket.emit("createRoom", { playerName,clientId,avatar: selectedAvatar })
}
  
 function handleJoin() {
  const clientId = getOrCreateClientId()
  sessionStorage.setItem("playerName", playerName)
  sessionStorage.setItem("avatar", selectedAvatar) 
  socket.emit("joinRoom", { roomId, playerName,clientId,avatar: selectedAvatar })
}

  return (
    <div className="lobby">
      <div className="card">
        <h1>Enter the Lobby</h1>
        <p>Ready to unleash your inner artist?</p>
        
        <input type="text" placeholder="enter your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)}/>
        
        <div className="avatar-picker">
          {AVATARS.map((emoji, i) => (
            <button
              key={i}
              className={`avatar-btn ${selectedAvatar === i ? 'selected' : ''}`}
              onClick={() => setSelectedAvatar(i)}
            >
              {emoji}
            </button>
          ))}
        </div>
        

        <div className="or">OR</div>

        <div className="bottom-section">
          <div className="join-room">
            <p>Got a room code?</p>
            <input type="text" placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)}/>
            <button className="join-btn" onClick={handleJoin}>Join Room →</button>
          </div>

          <div className="create-room">
            <p>Start your own chaos!</p>
            <button className="create-btn" onClick={handleCreate}>+ Create Private Room</button>
          </div>
        </div>
      </div>
    </div>
  )


}
export default Lobby