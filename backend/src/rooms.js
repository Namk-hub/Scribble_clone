
import words from "./word.js"
const rooms=new Map()


function createRoom(playerName,socketId){
  const room={
    id:Math.random().toString(36).substring(2, 8).toUpperCase(),
    players:[{id:socketId,name:playerName}],
    hostId:socketId,
    gameState: {
    phase: 'waiting',
    currentDrawer: null,
    currentWord: null,
    round: 0,
    correctGuessers: [],
    scores: {},
    drawerQueue: [],}
  };
  room.gameState.scores[socketId]=0
  rooms.set(room.id,room);
  return room
}
function joinRoom(roomID,playerName,socketId){
  const room=rooms.get(roomID)
  if(!room){
    return {error:"invalid roomID"}
  }
  room.players.push({id:socketId,name:playerName})
  room.gameState.scores[socketId]=0
  return room;
}

function removePlayer(roomId,socketId){
  const room=rooms.get(roomId)
  if(!room){
    return {error:"invalid roomID"}
  }
  room.players=room.players.filter(player=> player.id!=socketId )
  
  if (room.players.length === 0) {
      rooms.delete(roomId)
      return { wasDeleted:true}
    }

     // Make the next person in the array (index 0) the new host
    if (room.hostId === socketId) {
    room.hostId = room.players[0].id;
    console.log(`New host assigned: ${room.players[0].name}`);
  }

  return {room,wasDeleted:false}
  }

  function StartGame(roomId){
    const room=rooms.get(roomId)
     if(!room){
    return {error:"invalid roomID"}
    }
    room.gameState.drawerQueue=room.players.map(p=>p.id)
    room.gameState.phase="picking"
    return nextTurn(roomId)
  }

  function nextTurn(roomId){
    const room=rooms.get(roomId)
     if(!room){
    return {error:"invalid roomID"}
    }
    room.gameState.currentDrawer=room.gameState.drawerQueue.shift()
    room.gameState.round+=1
    room.gameState.currentWord=null
    const list=words.getRandomWords(room.gameState.round)
    return{room,list}
  }

  function submitGuess(roomId,guess,socketId){
    const room=rooms.get(roomId)
     if(!room){
    return {error:"invalid roomID"}
    }
    const eligibleCount=room.players.length -1 
    if(room.gameState.currentWord===guess){
      room.gameState.correctGuessers.push(socketId)
      const points = (room.players.length * 100) - (room.gameState.correctGuessers.length * 100)
      room.gameState.scores[socketId]+=points
      const turnOver=room.gameState.correctGuessers.length
      return{points,correct:true,turnOver:eligibleCount==turnOver}
    }
    else{
      return{correct:false}
    }
  }
export default  {rooms,createRoom,joinRoom,removePlayer,StartGame,nextTurn,submitGuess}