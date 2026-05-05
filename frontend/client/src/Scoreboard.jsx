import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOrCreateClientId } from './utils';
import './Scoreboard.css';
function Scoreboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const { scores, players, roomId } = location.state
  players.sort((a, b) => scores[b.clientId] - scores[a.clientId])

  const winners = players.slice(0, 3);
  const others = players.slice(3);

  return (
    <div className="scoreboard-page">

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
          {winners[0] ? <div className="podium-item item-1">
            <div className="rank-badge">1</div>
            <div className="podium-avatar">{winners[0].avatar}</div>
            <div className="podium-name">{winners[0].name}</div>
            <div className="podium-pts">{scores[winners[0].clientId]}</div>
          </div> : null}

          {/* 2nd Place */}
          {winners[1] ? <div className="podium-item item-2">
            <div className="rank-badge">2</div>
            <div className="podium-avatar">{winners[1].avatar}</div>
            <div className="podium-name">{winners[1].name}</div>
            <div className="podium-pts">{scores[winners[1].clientId]}</div>
          </div> : null}

          {/* 3rd Place */}
          {winners[2] ? <div className="podium-item item-3">
            <div className="rank-badge">3</div>
            <div className="podium-avatar">{winners[2].avatar}</div>
            <div className="podium-name">{winners[2].name}</div>
            <div className="podium-pts">{scores[winners[2].clientId]}</div>
          </div> : null}
        </div>

        <div className="sb-standings">
          {others.map((player, index) => (
            <div key={index} className="standing-row">
              <div className="standing-rank">{index + 4}</div>
              <div className="standing-avatar">{player.avatar}</div>
              <div className="standing-name">{player.name}</div>
              <div className="standing-pts">{scores[player.clientId]}</div>
            </div>
          ))}
        </div>

        <button className="sb-continue-btn" onClick={() => navigate(`/room/${roomId}`)}>
          Continue <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default Scoreboard;
