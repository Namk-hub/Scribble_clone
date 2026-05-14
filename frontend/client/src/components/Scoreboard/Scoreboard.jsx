import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AVATARS } from '../../utils/avatars';
import './Scoreboard.css';

function Scoreboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};
  const scores = state.scores || {};
  const players = [...(state.players || [])];
  const roomId = state.roomId || '';

  // Sort players by score
  players.sort((a, b) => (scores[b.clientId] || 0) - (scores[a.clientId] || 0));

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
            <div className="podium-avatar">{AVATARS[winners[0].avatar] || '👤'}</div>
            <div className="podium-name">{winners[0].name}</div>
            <div className="podium-pts">{scores[winners[0].clientId] || 0}</div>
          </div> : null}

          {/* 2nd Place */}
          {winners[1] ? <div className="podium-item item-2">
            <div className="rank-badge">2</div>
            <div className="podium-avatar">{AVATARS[winners[1].avatar] || '👤'}</div>
            <div className="podium-name">{winners[1].name}</div>
            <div className="podium-pts">{scores[winners[1].clientId] || 0}</div>
          </div> : null}

          {/* 3rd Place */}
          {winners[2] ? <div className="podium-item item-3">
            <div className="rank-badge">3</div>
            <div className="podium-avatar">{AVATARS[winners[2].avatar] || '👤'}</div>
            <div className="podium-name">{winners[2].name}</div>
            <div className="podium-pts">{scores[winners[2].clientId] || 0}</div>
          </div> : null}
        </div>

        <div className="sb-standings">
          {others.map((player, index) => (
            <div key={index} className="standing-row">
              <div className="standing-rank">{index + 4}</div>
              <div className="standing-avatar">{AVATARS[player.avatar] || '👤'}</div>
              <div className="standing-name">{player.name}</div>
              <div className="standing-pts">{scores[player.clientId] || 0}</div>
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
