
import { v4 as uuid } from 'uuid'

const rooms=new Map()


function createRoom(playerName,socketId){
  const room={
    id:uuid(),
    players:[{id:socketId,name:playerName}]
  };
  rooms.set(room.id,room);
  return room
}
function joinRoom(roomID,playerName,socketId){
  const find_room=rooms.get(roomID)
  if(!find_room){
    return console.log("invalid roomID")
  }
  find_room.players.push({id:socketId,name:playerName})
  return find_room;
}

function removePlayer(roomId,socketId){
  const find_room=rooms.get(roomId)
  if(!find_room){
    return console.log("invalid roomID")
  }
  find_room.players=find_room.players.filter(player=> player.id!=socketId )
  return find_room
}

export default  {rooms,createRoom,joinRoom,removePlayer}