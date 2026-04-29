import io from "./index";
import roomManager from "./rooms";


io.on("connection",(socket)=>{
  console.log("user connected successfully",socket.id)
  socket.on("createRoom",({playerName})=>{
    const room=roomManager.createRoom(playerName,socket.id)
    socket.roomId=room.id
    socket.join(room.id)
    socket.emit("created successfully",room)
  })

  socket.on("joinRoom",({roomId,playerName})=>{
    const find_room=roomManager.joinRoom(roomId,playerName,socket.id)
    if(find_room.error){
      return socket.emit("error","wrong roomId")
    }
    socket.roomId=roomId
    socket.join(find_room.id)
    io.to(find_room.id).emit("message",`${playerName}has joined!` )
  })

  socket.on("disconnect",()=>{
    if (!socket.roomId) return
    const room=roomManager.rooms.get(socket.roomId)
    if(!room){
      return socket.emit("error","room no doesnt exist")
    }
    const players=room.players
    const player=players.find(player => player.id===socket.id)
    const find_room=roomManager.removePlayer(socket.roomId,socket.id)
    if(find_room.error){
      return socket.emit("error","wrong roomId")
    }
    if(find_room.wasDeleted){
       return socket.emit("error","room no doesnt exist")
    }
  
    io.to(find_room.id).emit("message",`${player.name} has disconnected!` )
  })
})