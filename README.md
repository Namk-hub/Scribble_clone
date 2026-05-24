# Drawzy

A full-stack, real-time multiplayer drawing and guessing game inspired by Skribbl.io. Built with React, Node.js, and Socket.IO.

## 🚀 Features

- **Real-Time Multiplayer:** Create private rooms and invite friends using a unique Room ID.
- **Synchronized Drawing:** Smooth, real-time canvas updates across all connected clients.
- **Game Engine Logic:** Fully functional turn-based rounds, word picking, and round timers.
- **Fair Scoring System:** Points are awarded based on guess speed. The drawer also receives bonus points when their word is guessed!
- **Robust Connection Handling:** Automatically handles player disconnects, late joiners, and AFK players to keep the game running smoothly.
- **Chat & Guessing:** Real-time chat that auto-scrolls, with a case-insensitive validation engine for correct answers.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- React Router (Routing)
- Socket.IO Client (Real-time events)
- CSS (Vanilla, Flexbox/Grid for layout)

**Backend:**
- Node.js & Express
- Socket.IO (WebSocket server)
- Dotenv (Environment variables)

## 📂 Project Structure

```
scribble.io-clone/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── rooms.js    # Core game state & queue management
│   │   │   ├── socket.js   # WebSocket event handlers
│   │   │   └── word.js     # Word generation logic
│   │   └── index.js        # Express server entry point
│   └── package.json
└── frontend/
    └── client/
        ├── src/
        │   ├── components/
        │   │   ├── Lobby/          # Room creation/joining UI
        │   │   ├── Room/           # Drawing canvas & chat UI
        │   │   └── Scoreboard/     # End-of-game rankings
        │   ├── services/
        │   │   └── socket.js       # Socket connection instance
        │   ├── App.jsx             # Routes
        │   └── main.jsx
        └── package.json
```

## 💻 Running Locally

### 1. Start the Backend Server
Navigate to the backend directory, install dependencies, and run the server:
```bash
cd backend
npm install
node src/index.js
```
The backend will run on `http://localhost:3000`.

### 2. Start the Frontend Client
Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite development server:
```bash
cd frontend/client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## 🎮 How to Play

1. Open the frontend URL in your browser.
2. Enter your name and select an avatar.
3. Click **+ Create Private Room**.
4. Copy the Room ID and share it with friends.
5. Your friends can join by entering their name, selecting an avatar, entering the Room ID, and clicking **Join Room**.
6. When the host clicks "Start Game", the first player chooses a word and starts drawing!

## ✨ Recent Improvements

- **AFK Protection**: Added a 15-second timer for the word-picking phase. If a player goes AFK, their turn is automatically skipped.
- **Crash Prevention**: Implemented state sanitization to strip circular interval references, preventing "Maximum call stack size exceeded" errors over WebSockets.
- **Anti-Cheat Validation**: Added backend checks to ensure players can only pick from the words offered to them.

## Demo video:-


https://github.com/user-attachments/assets/543866c0-a38c-4daa-ace5-639322105b06


