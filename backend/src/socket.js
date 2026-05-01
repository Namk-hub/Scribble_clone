import roomManager from "./rooms.js";


export default function initSocket(io) {

  io.on("connection",(socket)=>{
  console.log("user connected successfully",socket.id)
  socket.on("createRoom",({playerName})=>{
     console.log("createRoom received", playerName)
    const room=roomManager.createRoom(playerName,socket.id)
    socket.roomId=room.id
    socket.join(room.id)
    socket.emit("created successfully",room)
  });

  //here socket.id doesnt exist due to refresh page effect
  socket.on("getRoomData",({roomId})=>{
    const room=roomManager.rooms.get(roomId)
    if (!room) return socket.emit("error", "room not found")
    socket.emit("RoomData",room)
  })

  socket.on("joinRoom",({roomId,playerName})=>{
    const result=roomManager.joinRoom(roomId,playerName,socket.id)
    if(result.error){
      return socket.emit("error","wrong roomId")
    }
    socket.roomId=roomId
    socket.join(roomId)
    io.to(roomId).emit("playerUpdate", result);
    
    socket.emit("joinedRoom", result)
    
  });


  socket.on("startGame",()=>{
    if (!socket.roomId) return
    const room=roomManager.rooms.get(socket.roomId)
    if (socket.id===room.hostId){
      const returnvalue=roomManager.StartGame(socket.roomId)
      const list=returnvalue.list
      const drawer = room.players.find(p => p.clientId === room.gameState.currentDrawer);
      if (drawer) {
        io.to(drawer.id).emit("wordChoices", list);
      }
      io.to(room.id).emit("turnStarted",`${room.gameState.currentDrawer} is picking!`)
    }
   
  });
  
  socket.on("pickWord",(drawerWord)=>{
     if (!socket.roomId) return
    const room=roomManager.rooms.get(socket.roomId)
    room.gameState.currentWord=drawerWord
    room.gameState.phase="drawing"
    io.to(room.id).emit("drawingStarted","drawing has beginnn")
  })

  socket.on("guess",({guess})=>{
    if (!socket.roomId) return
    const room=roomManager.rooms.get(socket.roomId)

    // Find the person guessing so we can get their clientId
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (room.gameState.phase!='drawing') return

    if (room.gameState.currentDrawer === player.clientId) return;
    if (room.gameState.correctGuessers.includes(player.clientId)) return;

    const result=roomManager.submitGuess(socket.roomId,guess,socket.id)
    if (!result.correct) return
    io.to(room.id).emit("correctGuess", { clientId: result.clientId, points: result.points })

    //clearing timerr
    if(result.turnOver){
      const {room:updatedRoom,list}=roomManager.nextTurn(socket.roomId)

      // Find the new drawer's socket
      const nextDrawer = updatedRoom.players.find(p => p.clientId === updatedRoom.gameState.currentDrawer);
      
      if (nextDrawer) {
        io.to(nextDrawer.id).emit("wordChoices", list);
      }
      io.to(updatedRoom.gameState.currentDrawer).emit("wordChoices", list)
      io.to(updatedRoom.id).emit("turnStarted", `${updatedRoom.gameState.currentDrawer} is picking!`)
    
    }
  })

  socket.on("disconnect",()=>{
    if (!socket.roomId) return
    const room=roomManager.rooms.get(socket.roomId)
    if(!room) return 

    const players=room.players
    const player=players.find(player => player.id===socket.id)
    const result=roomManager.removePlayer(socket.roomId,socket.id)

    if (result.error) return        // invalid roomId
  if (result.wasDeleted) return   // last player left, room gone

  
  // In initSocket disconnect:
  io.to(result.room.id).emit("playerUpdate", result.room);
  io.to(result.room.id).emit("message", `${player?.name} has disconnected!`)
})
})
}
