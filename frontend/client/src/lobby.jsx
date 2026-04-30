import './Lobby.css'
import { useState } from 'react'
import socket from './socket'



function Lobby() {
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(0)

  function handleCreate() {
  console.log("emitting createRoom", playerName)
  socket.emit("createRoom", { playerName })
}
  
 function handleJoin() {
  socket.emit("joinRoom", { roomId, playerName })
}

  return (
    <div className="lobby">
      <div className="card">
        <h1>Enter the Lobby</h1>
        <p>Ready to unleash your inner artist?</p>
        
        <input type="text" placeholder="enter your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)}/>
        
       <div className="avatar-picker">
          <button>avatar1</button>
          <button>avatar2</button>
          <button>avatar3</button>
          <button>avatar4</button>
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