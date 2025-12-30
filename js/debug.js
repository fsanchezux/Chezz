// ============ DEBUG / TESTING PANEL ============

/**
 * Open debug panel
 */
function openDebugPanel() {
  const debugPanel = document.getElementById('debugPanel');
  if (debugPanel) {
    debugPanel.classList.add('active');
    debugRefreshStats();
  }
}

/**
 * Close debug panel
 */
function closeDebugPanel() {
  const debugPanel = document.getElementById('debugPanel');
  if (debugPanel) {
    debugPanel.classList.remove('active');
  }
}

/**
 * Refresh and display current stats
 */
function debugRefreshStats() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('No user logged in. Please login first.');
    return;
  }

  const playerStats = getPlayerStats(currentUser.id);
  if (!playerStats) {
    alert('No stats found for current user');
    return;
  }

  // Update display
  document.getElementById('debugUserId').textContent = currentUser.id;
  document.getElementById('debugElo').textContent = playerStats.stats.elo;
  document.getElementById('debugTotalGames').textContent = playerStats.stats.totalGames;
  document.getElementById('debugRecord').textContent =
    `W ${playerStats.stats.wins} / L ${playerStats.stats.losses} / D ${playerStats.stats.draws}`;
  document.getElementById('debugStreak').textContent =
    `${playerStats.stats.currentStreak} (Best: ${playerStats.stats.bestStreak})`;

  // Update input fields
  document.getElementById('debugInputElo').value = playerStats.stats.elo;
  document.getElementById('debugInputWins').value = playerStats.stats.wins;
  document.getElementById('debugInputLosses').value = playerStats.stats.losses;
  document.getElementById('debugInputDraws').value = playerStats.stats.draws;

  // Display recent games
  displayRecentGames(playerStats);

  console.log('Stats refreshed');
}

/**
 * Display recent games in debug panel
 */
function displayRecentGames(playerStats) {
  const gamesContainer = document.getElementById('debugRecentGames');
  if (!gamesContainer) return;

  const recentGames = playerStats.recentGames.slice(0, 5);

  if (recentGames.length === 0) {
    gamesContainer.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">No games recorded yet</div>';
    return;
  }

  gamesContainer.innerHTML = recentGames.map(game => {
    const date = new Date(game.date).toLocaleDateString();
    return `
      <div class="debug-game-item">
        <div>
          <strong>${game.opponent}</strong> (${game.color}) - ${date}
          <br>
          <small>${game.moves} moves • ${game.endReason}</small>
        </div>
        <span class="debug-game-result ${game.result}">${game.result.toUpperCase()}</span>
      </div>
    `;
  }).join('');
}

/**
 * Add a fake win
 */
function debugAddWin() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('No user logged in');
    return;
  }

  const gameData = {
    opponent: 'Debug Test',
    opponentType: 'human',
    result: 'win',
    color: 'white',
    moves: Math.floor(Math.random() * 50) + 20,
    pgn: 'Debug test game',
    gameMode: 'singleplayer',
    endReason: 'checkmate'
  };

  recordGame(gameData);
  debugRefreshStats();
  updateUserBadge(currentUser);
  showToast('✅ Win added successfully!');
  console.log('Debug: Added win');
}

/**
 * Add a fake loss
 */
function debugAddLoss() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('No user logged in');
    return;
  }

  const gameData = {
    opponent: 'Debug Test',
    opponentType: 'human',
    result: 'loss',
    color: 'black',
    moves: Math.floor(Math.random() * 50) + 20,
    pgn: 'Debug test game',
    gameMode: 'singleplayer',
    endReason: 'checkmate'
  };

  recordGame(gameData);
  debugRefreshStats();
  updateUserBadge(currentUser);
  showToast('❌ Loss added successfully!');
  console.log('Debug: Added loss');
}

/**
 * Add a fake draw
 */
function debugAddDraw() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('No user logged in');
    return;
  }

  const gameData = {
    opponent: 'Debug Test',
    opponentType: 'human',
    result: 'draw',
    color: 'white',
    moves: Math.floor(Math.random() * 50) + 20,
    pgn: 'Debug test game',
    gameMode: 'singleplayer',
    endReason: 'stalemate'
  };

  recordGame(gameData);
  debugRefreshStats();
  updateUserBadge(currentUser);
  showToast('🤝 Draw added successfully!');
  console.log('Debug: Added draw');
}

/**
 * Apply manual stats modifications
 */
function debugApplyManualStats() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('No user logged in');
    return;
  }

  const elo = parseInt(document.getElementById('debugInputElo').value);
  const wins = parseInt(document.getElementById('debugInputWins').value);
  const losses = parseInt(document.getElementById('debugInputLosses').value);
  const draws = parseInt(document.getElementById('debugInputDraws').value);

  if (isNaN(elo) || isNaN(wins) || isNaN(losses) || isNaN(draws)) {
    alert('Please enter valid numbers');
    return;
  }

  const playerStats = getPlayerStats(currentUser.id);

  // Update stats
  playerStats.stats.elo = elo;
  playerStats.stats.wins = wins;
  playerStats.stats.losses = losses;
  playerStats.stats.draws = draws;
  playerStats.stats.totalGames = wins + losses + draws;

  // Save
  savePlayerStats(playerStats);

  // Refresh UI
  debugRefreshStats();
  updateUserBadge(currentUser);

  showToast('💾 Stats updated successfully!');
  console.log('Debug: Manual stats applied', {elo, wins, losses, draws});
}

/**
 * Show a test achievement notification
 */
function debugShowAchievement(achievementId) {
  const achievements = {
    'first_win': {
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first game',
      icon: '🏆'
    },
    'streak_5': {
      id: 'streak_5',
      name: 'On Fire',
      description: 'Win 5 games in a row',
      icon: '🔥'
    },
    'elo_1000': {
      id: 'elo_1000',
      name: 'Rising Star',
      description: 'Reach 1000 ELO',
      icon: '🌟'
    }
  };

  const achievement = achievements[achievementId];
  if (achievement) {
    showAchievementNotification(achievement);
    console.log('Debug: Showing achievement', achievementId);
  }
}

/**
 * Reset all stats for current user
 */
function debugResetStats() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('No user logged in');
    return;
  }

  if (!confirm('⚠️ Are you sure you want to reset all stats? This cannot be undone!')) {
    return;
  }

  resetStats(currentUser.id);

  // Reload stats
  getPlayerStats(currentUser.id);

  debugRefreshStats();
  updateUserBadge(currentUser);

  showToast('🔄 Stats reset successfully!');
  console.log('Debug: Stats reset');
}

/**
 * Clear all localStorage
 */
function debugClearStorage() {
  if (!confirm('⚠️ DANGER! This will clear ALL localStorage including user session. You will be logged out. Continue?')) {
    return;
  }

  localStorage.clear();
  showToast('🗑️ LocalStorage cleared! Reloading page...');

  setTimeout(() => {
    location.reload();
  }, 2000);

  console.log('Debug: LocalStorage cleared');
}

/**
 * Export current user data
 */
function debugExportData() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('No user logged in');
    return;
  }

  exportStats(currentUser.id);
  showToast('📥 Data exported successfully!');
  console.log('Debug: Data exported');
}

/**
 * Preset configurations for quick testing
 */
function debugApplyPreset(presetName) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('No user logged in');
    return;
  }

  const playerStats = getPlayerStats(currentUser.id);

  const presets = {
    'beginner': {
      elo: 500,
      wins: 2,
      losses: 5,
      draws: 1
    },
    'intermediate': {
      elo: 1000,
      wins: 25,
      losses: 20,
      draws: 5
    },
    'advanced': {
      elo: 1500,
      wins: 100,
      losses: 40,
      draws: 10
    },
    'master': {
      elo: 2000,
      wins: 500,
      losses: 100,
      draws: 50
    }
  };

  const preset = presets[presetName];
  if (preset) {
    playerStats.stats.elo = preset.elo;
    playerStats.stats.wins = preset.wins;
    playerStats.stats.losses = preset.losses;
    playerStats.stats.draws = preset.draws;
    playerStats.stats.totalGames = preset.wins + preset.losses + preset.draws;

    savePlayerStats(playerStats);
    debugRefreshStats();
    updateUserBadge(currentUser);

    showToast(`✨ Applied ${presetName} preset!`);
    console.log('Debug: Applied preset', presetName);
  }
}

/**
 * Keyboard shortcut listener
 */
document.addEventListener('keydown', function(e) {
  // Ctrl + Shift + D opens debug panel
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    openDebugPanel();
    console.log('Debug panel opened via keyboard shortcut (Ctrl+Shift+D)');
  }

  // ESC closes debug panel
  if (e.key === 'Escape') {
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel && debugPanel.classList.contains('active')) {
      closeDebugPanel();
    }
  }
});

// Log that debug tools are available
console.log('%c🛠️ DEBUG PANEL AVAILABLE', 'background: #222; color: #FFD700; font-size: 16px; padding: 10px;');
console.log('%cPress Ctrl+Shift+D to open debug panel', 'color: #17a2b8; font-size: 12px;');
console.log('%cAvailable functions:', 'color: #28a745; font-size: 12px;');
console.log('  - openDebugPanel()');
console.log('  - debugAddWin()');
console.log('  - debugAddLoss()');
console.log('  - debugAddDraw()');
console.log('  - debugApplyPreset("beginner"|"intermediate"|"advanced"|"master")');
console.log('  - debugResetStats()');
