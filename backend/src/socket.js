import roomManager from "./rooms.js";


export default function initSocket(io) {

  io.on("connection", (socket) => {
    console.log("user connected successfully", socket.id)
    socket.on("createRoom", ({ playerName, clientId, avatar }) => {
      console.log("createRoom received", playerName)
      const room = roomManager.createRoom(playerName, socket.id, clientId, avatar)
      socket.roomId = room.id
      socket.join(room.id)
      socket.emit("created successfully", room)
    });

    //here socket.id doesnt exist due to refresh page effect
    socket.on("getRoomData", ({ roomId, clientId }) => {
      const room = roomManager.rooms.get(roomId.toUpperCase())
      if (!room) return socket.emit("error", "room not found")
      socket.roomId = room.id // Ensure socket knows its room ID
      socket.join(room.id)
      socket.emit("RoomData", room)

      // If they are the drawer and it's picking phase, send them the choices
      if (room.gameState.phase === 'picking' && room.gameState.currentDrawer === clientId) {
        socket.emit("wordChoices", room.gameState.wordChoices)
      }
    })

    socket.on("joinRoom", ({ roomId, playerName, clientId, avatar }) => {
      console.log(`joinRoom attempt: roomId=${roomId}, name=${playerName}, clientId=${clientId}`)
      const room = roomManager.joinRoom(roomId, playerName, socket.id, clientId, avatar)
      if (room.error) {
        console.log(`joinRoom failed: ${room.error} for roomId: ${roomId}`)
        return socket.emit("error", "wrong roomId")
      }
      socket.roomId = room.id
      socket.join(room.id)
      io.to(room.id).emit("playerUpdate", room);

      socket.emit("joinedRoom", room)
      if (room.gameState.phase === 'picking' && room.gameState.currentDrawer === clientId) {
        socket.emit("wordChoices", room.gameState.wordChoices)
      }
      if (room.gameState.phase === 'drawing' && room.gameState.currentDrawer === clientId) {
        socket.emit("wordPicked", room.gameState.currentWord)
      }
      console.log("phase:", room.gameState.phase)
      console.log("currentDrawer:", room.gameState.currentDrawer)
      console.log("clientId joining:", clientId)
      console.log("wordChoices:", room.gameState.wordChoices)
    });


    socket.on("startGame", () => {
      if (!socket.roomId) return
      const room = roomManager.rooms.get(socket.roomId)
      if (socket.id === room.hostId) {
        const returnvalue = roomManager.StartGame(socket.roomId)
        const list = returnvalue.list
        const drawer = room.players.find(p => p.clientId === room.gameState.currentDrawer);
        if (drawer) {
          io.to(room.id).emit("playerUpdate", room)
          io.to(room.id).emit("turnStarted", `${drawer.name} is picking!`)
          io.to(drawer.id).emit("wordChoices", list);
        }

      }
    });

    socket.on("pickWord", (drawerWord) => {
      if (!socket.roomId) return
      const room = roomManager.rooms.get(socket.roomId)
      room.gameState.currentWord = drawerWord
      room.gameState.phase = "drawing"
      io.to(room.id).emit("drawingStarted", "drawing has beginnn")
      io.to(room.id).emit("playerUpdate", room)
    })

    socket.on("guess", ({ guess }) => {
      if (!socket.roomId) return
      const room = roomManager.rooms.get(socket.roomId)

      // Find the person guessing so we can get their clientId
      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      if (room.gameState.phase != 'drawing') return

      if (room.gameState.currentDrawer === player.clientId) return;
      if (room.gameState.correctGuessers.includes(player.clientId)) return;

      const result = roomManager.submitGuess(socket.roomId, guess, socket.id)
      if (!result.correct) return
      io.to(room.id).emit("correctGuess", { clientId: player.clientId, points: result.points })

      //clearing timerr
      if (result.turnOver) {
        const { room: updatedRoom, list } = roomManager.nextTurn(socket.roomId)

        const drawer = updatedRoom.players.find(p => p.clientId === updatedRoom.gameState.currentDrawer);

        io.to(updatedRoom.id).emit("playerUpdate", updatedRoom)
        io.to(updatedRoom.id).emit("turnStarted", `${drawer?.name || 'Someone'} is picking!`)

        if (drawer) {
          io.to(drawer.id).emit("wordChoices", list);
        }

      }
    })

    socket.on("draw", (data) => {
      socket.to(socket.roomId).emit("draw", data)
    })

    socket.on("clearCanvas", () => {
      socket.to(socket.roomId).emit("clearCanvas")
    })
    socket.on("disconnect", () => {
      if (!socket.roomId) return
      const roomId = socket.roomId;
      const oldSocketId = socket.id;

      setTimeout(() => {
        const room = roomManager.rooms.get(roomId);
        if (!room) return;

        const player = room.players.find(p => p.id === oldSocketId);
        if (!player) return; // Player reconnected (socket ID updated) or already removed

        const result = roomManager.removePlayer(roomId, oldSocketId);
        if (result.error) return;
        if (result.wasDeleted) return;

        io.to(result.room.id).emit("playerUpdate", result.room);
        io.to(result.room.id).emit("message", `${player.name} has disconnected!`);
      }, 5000);
    })
  })
}
