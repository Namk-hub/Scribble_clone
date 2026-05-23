import words from "./word.js";
const rooms = new Map();

function createRoom(playerName, socketId, clientId, avatar) {
  const room = {
    id: Math.random().toString(36).substring(2, 8).toUpperCase(),
    players: [{ id: socketId, clientId, name: playerName, avatar: avatar }],
    hostId: socketId,
    hostClientId: clientId,
    gameState: {
      phase: "waiting",
      wordChoices: [],
      currentDrawer: null,
      currentWord: null,
      round: 1,
      correctGuessers: [],
      scores: {},
      drawerQueue: [],
    },
  };
  room.gameState.scores[clientId] = 0;
  rooms.set(room.id, room);
  return room;
}
function joinRoom(roomID, playerName, socketId, clientId, avatar) {
  const room = rooms.get(roomID.toUpperCase());
  if (!room) {
    return { error: "invalid roomID" };
  }
  // Use clientId to check for existing players
  const existing = room.players.find((p) => p.clientId === clientId);
  if (existing) {
    // Returning player — update their socket ID, don't add duplicate
    existing.id = socketId;
    existing.name = playerName;
    // If they were the host, update hostId to new socket
    if (room.hostClientId === clientId) {
      room.hostId = socketId;
    }
  } else {
    room.players.push({
      id: socketId,
      clientId,
      name: playerName,
      avatar: avatar,
    });
    room.gameState.scores[clientId] = 0;
    // If game is already in progress, add to drawer queue so they get a turn
    if (room.gameState.phase !== "waiting") {
      room.gameState.drawerQueue.push(clientId);
    }
  }

  return room;
}

function removePlayer(roomId, socketId, clientId) {
  const room = rooms.get(roomId);

  if (!room) {
    return { error: "invalid roomID" };
  }

  const leaving = room.players.find((p) => p.id === socketId);
  if (!leaving) return { wasDeleted: false, room };
  const leavingClientId = leaving.clientId;
  room.players = room.players.filter((player) => player.id != socketId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    return { wasDeleted: true };
  }

  room.gameState.drawerQueue = room.gameState.drawerQueue.filter(
    (id) => id !== leavingClientId,
  );

  // Make the next person in the array (index 0) the new host
  if (room.hostClientId === leavingClientId) {
    room.hostId = room.players[0].id;
    room.hostClientId = room.players[0].clientId;
  }

  return { room, wasDeleted: false };
}

function StartGame(roomId, clientId) {
  const room = rooms.get(roomId);
  if (!room) {
    return { error: "invalid roomID" };
  }
  room.gameState.drawerQueue = room.players.map((p) => p.clientId);
  room.gameState.phase = "picking";
  return nextTurn(roomId);
}

function nextTurn(roomId) {
  const room = rooms.get(roomId);
  if (!room) {
    return { error: "invalid roomID" };
  }
  // RESET round-specific data

  room.gameState.correctGuessers = [];
  room.gameState.currentWord = null;

  // Refill queue if empty
  if (room.gameState.drawerQueue.length === 0) {
    room.gameState.drawerQueue = room.players.map((p) => p.clientId);
    room.gameState.round += 1;
    if (room.gameState.round > 3) {
      room.gameState.phase = "ended";
      return { room, ended: true };
    }
  }

  room.gameState.currentDrawer = room.gameState.drawerQueue.shift();

  const list = words.getRandomWords(room.gameState.round);
  room.gameState.wordChoices = list;
  room.gameState.phase = "picking";
  return { room, list };
}

function submitGuess(roomId, guess, socketId) {
  const room = rooms.get(roomId);
  if (!room) {
    return { error: "invalid roomID" };
  }

  const player = room.players.find((p) => p.id === socketId);
  if (!player || room.gameState.currentDrawer === player.clientId)
    return { correct: false };

  if (
    room.gameState.currentWord &&
    guess &&
    room.gameState.currentWord.toLowerCase().trim() ===
      guess.toLowerCase().trim()
  ) {
    const clientId = player.clientId;
    if (room.gameState.correctGuessers.includes(clientId))
      return { correct: false };
    room.gameState.correctGuessers.push(clientId);

    const points = Math.max(
      0,
      room.players.length * 100 - room.gameState.correctGuessers.length * 100,
    );
    room.gameState.scores[clientId] =
      (room.gameState.scores[clientId] || 0) + points;

    // Award drawer bonus points
    const drawerClientId = room.gameState.currentDrawer;
    if (drawerClientId) {
      room.gameState.scores[drawerClientId] =
        (room.gameState.scores[drawerClientId] || 0) + 50;
    }

    const turnOver =
      room.gameState.correctGuessers.length === room.players.length - 1;
    return { points, correct: true, turnOver };
  }

  return { correct: false };
}

export default {
  rooms,
  createRoom,
  joinRoom,
  removePlayer,
  StartGame,
  nextTurn,
  submitGuess,
};
