import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Scoreboard.css';

// Mock avatars
const AVATARS = ['🐱', '🐶', '🐸', '🐼', '🐯', '🐨', '🐰', '🦁', '🐷', '🦊'];

function Scoreboard() {
  const navigate = useNavigate();

  // MOCK DATA - You can replace this with location.state or socket data later
  const players = [
    { name: 'Sketchy_Cat', pts: 1240, avatar: 2 },
    { name: 'Doodle_Bunny', pts: 980, avatar: 6 },
    { name: 'ColorMaster', pts: 860, avatar: 4 },
    { name: 'BrushKing', pts: 760, avatar: 3 },
    { name: 'Rocket_Rider', pts: 645, avatar: 0 },
    { name: 'Pinky_Star', pts: 530, avatar: 7 },
    { name: 'ArtWhiz', pts: 420, avatar: 8 },
    { name: 'DoughnutDude', pts: 310, avatar: 5 },
  ];

  const winners = players.slice(0, 3);
  const others = players.slice(3);

  return (
    <div className="scoreboard-page">
      {/* Background Scribbles (Decorations) */}
      <div className="scribble scribble-pen">✏️</div>
      <div className="scribble scribble-heart">❤️</div>
      <div className="scribble scribble-star">⭐</div>
      <div className="scribble scribble-loop">➰</div>
      <div className="scribble scribble-zig">〰️</div>
      <div className="scribble scribble-crown">👑</div>

      <header className="sb-header">
        <div className="sb-logo">Skribbl<span>.io</span></div>
        <nav className="sb-nav">
          <span>Lobby</span>
          <span>Galleries</span>
        </nav>
        <div className="sb-settings">⚙️</div>
      </header>

      <div className="sb-card">
        <div className="sb-title-group">
          <div className="sb-main-title">🏆 Round Complete!</div>
          <div className="sb-subtitle">Great guesses!</div>
        </div>

        <div className="sb-podium">
          {/* 1st Place */}
          <div className="podium-item item-1">
            <div className="rank-badge">1</div>
            <div className="podium-avatar">{AVATARS[winners[0].avatar]}</div>
            <div className="podium-name">{winners[0].name}</div>
            <div className="podium-pts">{winners[0].pts} pts</div>
          </div>

          {/* 2nd Place */}
          <div className="podium-item item-2">
            <div className="rank-badge">2</div>
            <div className="podium-avatar">{AVATARS[winners[1].avatar]}</div>
            <div className="podium-name">{winners[1].name}</div>
            <div className="podium-pts">{winners[1].pts} pts</div>
          </div>

          {/* 3rd Place */}
          <div className="podium-item item-3">
            <div className="rank-badge">3</div>
            <div className="podium-avatar">{AVATARS[winners[2].avatar]}</div>
            <div className="podium-name">{winners[2].name}</div>
            <div className="podium-pts">{winners[2].pts} pts</div>
          </div>
        </div>

        <div className="sb-standings">
          {others.map((player, index) => (
            <div key={index} className="standing-row">
              <div className="standing-rank">{index + 4}</div>
              <div className="standing-avatar">{AVATARS[player.avatar]}</div>
              <div className="standing-name">{player.name}</div>
              <div className="standing-pts">{player.pts} pts</div>
            </div>
          ))}
        </div>

        <button className="sb-continue-btn" onClick={() => navigate('/')}>
          Continue <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default Scoreboard;
