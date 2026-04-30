
import { v4 as uuid } from 'uuid'
import words from "./word"
const rooms=new Map()


function createRoom(playerName,socketId){
  const room={
    id:uuid(),
    players:[{id:socketId,name:playerName}],
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
  const find_room=rooms.get(roomID)
  if(!find_room){
    return {error:"invalid roomID"}
  }
  find_room.players.push({id:socketId,name:playerName})
  find_room.gameState.scores[socketId]=0
  return find_room;
}

function removePlayer(roomId,socketId){
  const find_room=rooms.get(roomId)
  if(!find_room){
    return {error:"invalid roomID"}
  }
  find_room.players=find_room.players.filter(player=> player.id!=socketId )
  
  if (find_room.players.length === 0) {
      rooms.delete(roomId)
      return { wasDeleted:true}
    }
  return {find_room,wasDeleted:false}
  }

  function StartGame(roomId){
    const room=rooms.get(roomId)
     if(!find_room){
    return {error:"invalid roomID"}
    }
    room.gameState.drawerQueue=room.players.map(p=>p.id)
    room.gameState.phase="picking"
    return nextTurn(roomId)
  }

  function nextTurn(roomId){
    const room=rooms.get(roomId)
     if(!find_room){
    return {error:"invalid roomID"}
    }
    room.gameState.currentDrawer=room.gameState.drawerQueue.shift()
    room.gameState.round+=1
    room.gameState.currentWord=null
    const list=words.getRandomWords()
    return{room,list}
  }

  function submitGuess(roomId,guess,socketId){
    const room=rooms.get(roomId)
     if(room){
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