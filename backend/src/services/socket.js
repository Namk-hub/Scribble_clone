import roomManager from "./rooms.js";

// Strip non-serializable properties (interval timer has circular refs)
function sanitizeRoom(room) {
  if (!room) return room;
  return {
    ...room,
    gameState: {
      ...room.gameState,
      interval: undefined,
    },
  };
}

function clearRoomTimers(room) {
  if (room.gameState.interval) {
    clearInterval(room.gameState.interval);
    room.gameState.interval = null;
  }
}

function handleTurnEnd(roomId, io, timeUp = false) {
  const room = roomManager.rooms.get(roomId);
  if (!room) return;

  // Guard: if not in drawing or picking phase, turn already ended (prevents double-call)
  if (
    room.gameState.phase !== "drawing" &&
    room.gameState.phase !== "picking" &&
    !timeUp
  )
    return;

  clearRoomTimers(room);

  if (timeUp) {
    if (room.gameState.phase === "picking") {
      io.to(roomId).emit("message", {
        type: "system",
        text: `The drawer took too long to pick a word!`,
      });
    } else {
      io.to(roomId).emit("message", {
        type: "system",
        text: `Time's up! The word was: ${room.gameState.currentWord}`,
      });
    }
  }

  const nextTurnData = roomManager.nextTurn(roomId);
  const updatedRoom = nextTurnData.room;

  if (nextTurnData.ended) {
    console.log("Game ended! Emitting gameOver");
    io.to(updatedRoom.id).emit("playerUpdate", sanitizeRoom(updatedRoom));
    io.to(updatedRoom.id).emit("gameOver", {
      scores: updatedRoom.gameState.scores,
      players: updatedRoom.players,
      roomId: updatedRoom.id,
    });
  } else {
    const list = nextTurnData.list;
    const drawer = updatedRoom.players.find(
      (p) => p.clientId === updatedRoom.gameState.currentDrawer,
    );
    console.log(
      `Next turn: round ${updatedRoom.gameState.round}, drawer: ${drawer?.name}`,
    );
    io.to(updatedRoom.id).emit("playerUpdate", sanitizeRoom(updatedRoom));
    io.to(updatedRoom.id).emit(
      "turnStarted",
      `${drawer?.name || "Someone"} is picking!`,
    );
    if (drawer) {
      io.to(drawer.id).emit("wordChoices", list);
      startTimer(updatedRoom.id, io, 15); // Start 15s picking timer
    }
    io.to(updatedRoom.id).emit("clearCanvas");
  }
}

function startTimer(roomId, io, duration = 75) {
  const room = roomManager.rooms.get(roomId);
  if (!room) return;

  clearRoomTimers(room);
  room.gameState.timeRemaining = duration;
  io.to(roomId).emit("timerUpdate", room.gameState.timeRemaining);

  room.gameState.interval = setInterval(() => {
    room.gameState.timeRemaining -= 1;
    io.to(roomId).emit("timerUpdate", room.gameState.timeRemaining);

    if (room.gameState.timeRemaining <= 0) {
      handleTurnEnd(roomId, io, true);
    }
  }, 1000);
}

export default function initSocket(io) {
  io.on("connection", (socket) => {
    socket.on("createRoom", ({ playerName, clientId, avatar }) => {
      const room = roomManager.createRoom(
        playerName,
        socket.id,
        clientId,
        avatar,
      );
      socket.roomId = room.id;
      socket.join(room.id);
      socket.emit("created successfully", sanitizeRoom(room));
    });

    socket.on("getRoomData", ({ roomId, clientId }) => {
      const room = roomManager.rooms.get(roomId.toUpperCase());
      if (!room) return socket.emit("error", "room not found");
      socket.roomId = room.id;
      socket.join(room.id);
      socket.emit("RoomData", sanitizeRoom(room));

      if (
        room.gameState.phase === "picking" &&
        room.gameState.currentDrawer === clientId
      ) {
        socket.emit("wordChoices", room.gameState.wordChoices);
      }
      if (room.gameState.timeRemaining > 0) {
        socket.emit("timerUpdate", room.gameState.timeRemaining);
      }
    });

    socket.on("joinRoom", ({ roomId, playerName, clientId, avatar }) => {
      const room = roomManager.joinRoom(
        roomId,
        playerName,
        socket.id,
        clientId,
        avatar,
      );
      if (room.error) {
        return socket.emit("error", "wrong roomId");
      }
      socket.roomId = room.id;
      socket.join(room.id);
      io.to(room.id).emit("playerUpdate", sanitizeRoom(room));
      socket.emit("joinedRoom", sanitizeRoom(room));

      if (
        room.gameState.phase === "picking" &&
        room.gameState.currentDrawer === clientId
      ) {
        socket.emit("wordChoices", room.gameState.wordChoices);
      }
      if (
        room.gameState.phase === "drawing" &&
        room.gameState.currentDrawer === clientId
      ) {
        socket.emit("wordPicked", room.gameState.currentWord);
      }
      if (room.gameState.timeRemaining > 0) {
        socket.emit("timerUpdate", room.gameState.timeRemaining);
      }
    });

    socket.on("startGame", () => {
      if (!socket.roomId) return;
      const room = roomManager.rooms.get(socket.roomId);
      if (socket.id === room.hostId && room.gameState.phase === "waiting") {
        const returnvalue = roomManager.StartGame(socket.roomId);
        const list = returnvalue.list;
        const drawer = room.players.find(
          (p) => p.clientId === room.gameState.currentDrawer,
        );
        if (drawer) {
          io.to(room.id).emit("playerUpdate", sanitizeRoom(room));
          io.to(room.id).emit("turnStarted", `${drawer.name} is picking!`);
          io.to(drawer.id).emit("wordChoices", list);
          io.to(room.id).emit("clearCanvas");
          startTimer(room.id, io, 15); // Start 15s picking timer
        }
      }
    });

    socket.on("pickWord", (drawerWord) => {
      if (!socket.roomId) return;
      const room = roomManager.rooms.get(socket.roomId);

      const player = room.players.find((p) => p.id === socket.id);
      if (!player || player.clientId !== room.gameState.currentDrawer) return;

      // Prevent players from sending arbitrary words
      if (!room.gameState.wordChoices.includes(drawerWord)) return;

      room.gameState.currentWord = drawerWord;
      room.gameState.phase = "drawing";
      io.to(room.id).emit("drawingStarted", "drawing has beginnn");
      io.to(room.id).emit("playerUpdate", sanitizeRoom(room));

      startTimer(socket.roomId, io, 60);
    });

    socket.on("guess", ({ guess }) => {
      if (!socket.roomId) return;
      const room = roomManager.rooms.get(socket.roomId);

      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;

      if (room.gameState.phase != "drawing") return;

      if (room.gameState.currentDrawer === player.clientId) return;
      if (room.gameState.correctGuessers.includes(player.clientId)) return;

      const result = roomManager.submitGuess(socket.roomId, guess, socket.id);

      if (result.correct) {
        io.to(room.id).emit("correctGuess", {
          clientId: player.clientId,
          points: result.points,
        });
        io.to(room.id).emit("message", {
          type: "system",
          text: `${player.name} guessed the word!`,
        });

        if (result.turnOver) {
          handleTurnEnd(socket.roomId, io, false);
        }
      } else {
        io.to(room.id).emit("message", {
          type: "chat",
          text: guess,
          playerName: player.name,
        });
      }
    });

    socket.on("draw", (data) => {
      if (!socket.roomId) return;
      const room = roomManager.rooms.get(socket.roomId);
      const player = room.players.find((p) => p.id === socket.id);
      if (player && player.clientId === room.gameState.currentDrawer) {
        socket.to(socket.roomId).emit("draw", data);
      }
    });

    socket.on("clearCanvas", () => {
      if (!socket.roomId) return;
      const room = roomManager.rooms.get(socket.roomId);
      const player = room.players.find((p) => p.id === socket.id);
      if (player && player.clientId === room.gameState.currentDrawer) {
        socket.to(socket.roomId).emit("clearCanvas");
      }
    });

    socket.on("disconnect", () => {
      if (!socket.roomId) return;
      const roomId = socket.roomId;
      const oldSocketId = socket.id;

      setTimeout(() => {
        const room = roomManager.rooms.get(roomId);
        if (!room) return;

        const player = room.players.find((p) => p.id === oldSocketId);
        if (!player) return; // Player reconnected

        const result = roomManager.removePlayer(roomId, oldSocketId);
        if (result.error) return;
        if (result.wasDeleted) {
          clearRoomTimers(result.room || room);
          return;
        }

        io.to(result.room.id).emit("playerUpdate", sanitizeRoom(result.room));
        io.to(result.room.id).emit("message", {
          type: "system",
          text: `${player.name} has disconnected!`,
        });

        if (
          result.room.gameState.phase === "drawing" ||
          result.room.gameState.phase === "picking"
        ) {
          if (result.room.gameState.currentDrawer === player.clientId) {
            io.to(result.room.id).emit("message", {
              type: "system",
              text: `The drawer disconnected!`,
            });
            handleTurnEnd(roomId, io, false);
          } else if (result.room.gameState.phase === "drawing") {
            const remainingGuessers = result.room.players.length - 1;
            if (
              remainingGuessers === 0 ||
              result.room.gameState.correctGuessers.length >= remainingGuessers
            ) {
              handleTurnEnd(roomId, io, false);
            }
          }
        }
      }, 5000);
    });
  });
}
