
import { v4 as uuid } from 'uuid'

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
    maxRounds: 3,
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

export default  {rooms,createRoom,joinRoom,removePlayer}