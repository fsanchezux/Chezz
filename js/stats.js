// ============ PLAYER STATISTICS & GAME HISTORY ============

/**
 * Initialize player stats for a new user
 */
function initializePlayerStats(userId) {
  return {
    userId: userId,
    stats: {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      elo: 500, // Starting ELO
      gamesAsWhite: 0,
      gamesAsBlack: 0,
      winsAsWhite: 0,
      winsAsBlack: 0,
      totalMoves: 0,
      averageMovesPerGame: 0,
      longestGame: 0,
      shortestGame: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayed: null
    },
    recentGames: [],
    achievements: []
  };
}

/**
 * Get player stats from localStorage
 */
function getPlayerStats(userId) {
  if (!userId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    userId = currentUser.id;
  }

  const key = `chessStats_${userId}`;
  const savedStats = localStorage.getItem(key);

  if (savedStats) {
    try {
      return JSON.parse(savedStats);
    } catch (e) {
      console.error('Error parsing stats:', e);
      return initializePlayerStats(userId);
    }
  }

  // Initialize new stats
  const newStats = initializePlayerStats(userId);
  savePlayerStats(newStats);
  return newStats;
}

/**
 * Save player stats to localStorage
 */
function savePlayerStats(playerStats) {
  if (!playerStats || !playerStats.userId) {
    console.error('Invalid player stats');
    return false;
  }

  const key = `chessStats_${playerStats.userId}`;

  try {
    localStorage.setItem(key, JSON.stringify(playerStats));
    console.log('Stats saved successfully');
    return true;
  } catch (e) {
    console.error('Error saving stats:', e);

    // If storage is full, try to cleanup old games
    if (e.name === 'QuotaExceededError') {
      cleanupOldGames(playerStats);
      try {
        localStorage.setItem(key, JSON.stringify(playerStats));
        return true;
      } catch (e2) {
        console.error('Still failed after cleanup:', e2);
        return false;
      }
    }
    return false;
  }
}

/**
 * Record a completed game
 */
function recordGame(gameData) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error('No current user');
    return false;
  }

  const playerStats = getPlayerStats(currentUser.id);

  // Create game record
  const gameRecord = {
    id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
    opponent: gameData.opponent || 'Unknown',
    opponentType: gameData.opponentType || 'human', // human, ai, online
    result: gameData.result, // 'win', 'loss', 'draw'
    color: gameData.color, // 'white', 'black'
    moves: gameData.moves || 0,
    pgn: gameData.pgn || '',
    gameMode: gameData.gameMode || 'singleplayer', // singleplayer, multiplayer
    endReason: gameData.endReason || 'checkmate' // checkmate, stalemate, resignation, timeout
  };

  // Update statistics
  playerStats.stats.totalGames++;
  playerStats.stats.lastPlayed = gameRecord.date;
  playerStats.stats.totalMoves += gameRecord.moves;

  // Update color stats
  if (gameRecord.color === 'white') {
    playerStats.stats.gamesAsWhite++;
  } else {
    playerStats.stats.gamesAsBlack++;
  }

  // Update result stats
  if (gameRecord.result === 'win') {
    playerStats.stats.wins++;
    playerStats.stats.currentStreak++;

    if (gameRecord.color === 'white') {
      playerStats.stats.winsAsWhite++;
    } else {
      playerStats.stats.winsAsBlack++;
    }

    // Update best streak
    if (playerStats.stats.currentStreak > playerStats.stats.bestStreak) {
      playerStats.stats.bestStreak = playerStats.stats.currentStreak;
    }

    // Update ELO (simple calculation, +25 for win)
    playerStats.stats.elo += 25;

  } else if (gameRecord.result === 'loss') {
    playerStats.stats.losses++;
    playerStats.stats.currentStreak = 0;

    // Update ELO (-15 for loss)
    playerStats.stats.elo = Math.max(0, playerStats.stats.elo - 15);

  } else if (gameRecord.result === 'draw') {
    playerStats.stats.draws++;
    playerStats.stats.currentStreak = 0;

    // Update ELO (+5 for draw)
    playerStats.stats.elo += 5;
  }

  // Update average moves
  playerStats.stats.averageMovesPerGame = Math.round(
    playerStats.stats.totalMoves / playerStats.stats.totalGames
  );

  // Update longest/shortest game
  if (gameRecord.moves > 0) {
    if (playerStats.stats.longestGame === 0 || gameRecord.moves > playerStats.stats.longestGame) {
      playerStats.stats.longestGame = gameRecord.moves;
    }

    if (playerStats.stats.shortestGame === 0 || gameRecord.moves < playerStats.stats.shortestGame) {
      playerStats.stats.shortestGame = gameRecord.moves;
    }
  }

  // Add to recent games (keep last 50)
  playerStats.recentGames.unshift(gameRecord);
  if (playerStats.recentGames.length > 50) {
    playerStats.recentGames = playerStats.recentGames.slice(0, 50);
  }

  // Check for achievements
  checkAchievements(playerStats);

  // Save updated stats
  savePlayerStats(playerStats);

  console.log('Game recorded:', gameRecord.id);
  return gameRecord;
}

/**
 * Check and award achievements
 */
function checkAchievements(playerStats) {
  const achievements = [];
  const stats = playerStats.stats;

  // First Win
  if (stats.wins === 1 && !hasAchievement(playerStats, 'first_win')) {
    achievements.push({
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first game',
      date: new Date().toISOString(),
      icon: '🏆'
    });
  }

  // 10 Wins
  if (stats.wins === 10 && !hasAchievement(playerStats, 'ten_wins')) {
    achievements.push({
      id: 'ten_wins',
      name: 'Veteran Player',
      description: 'Win 10 games',
      date: new Date().toISOString(),
      icon: '⭐'
    });
  }

  // 50 Wins
  if (stats.wins === 50 && !hasAchievement(playerStats, 'fifty_wins')) {
    achievements.push({
      id: 'fifty_wins',
      name: 'Chess Master',
      description: 'Win 50 games',
      date: new Date().toISOString(),
      icon: '👑'
    });
  }

  // Win Streak 5
  if (stats.currentStreak === 5 && !hasAchievement(playerStats, 'streak_5')) {
    achievements.push({
      id: 'streak_5',
      name: 'On Fire',
      description: 'Win 5 games in a row',
      date: new Date().toISOString(),
      icon: '🔥'
    });
  }

  // Win Streak 10
  if (stats.currentStreak === 10 && !hasAchievement(playerStats, 'streak_10')) {
    achievements.push({
      id: 'streak_10',
      name: 'Unstoppable',
      description: 'Win 10 games in a row',
      date: new Date().toISOString(),
      icon: '⚡'
    });
  }

  // ELO Milestones
  if (stats.elo >= 1000 && !hasAchievement(playerStats, 'elo_1000')) {
    achievements.push({
      id: 'elo_1000',
      name: 'Rising Star',
      description: 'Reach 1000 ELO',
      date: new Date().toISOString(),
      icon: '🌟'
    });
  }

  if (stats.elo >= 1500 && !hasAchievement(playerStats, 'elo_1500')) {
    achievements.push({
      id: 'elo_1500',
      name: 'Expert Player',
      description: 'Reach 1500 ELO',
      date: new Date().toISOString(),
      icon: '💎'
    });
  }

  // Add new achievements
  if (achievements.length > 0) {
    playerStats.achievements.push(...achievements);

    // Show achievement notification
    achievements.forEach(achievement => {
      showAchievementNotification(achievement);
    });
  }
}

/**
 * Check if player has an achievement
 */
function hasAchievement(playerStats, achievementId) {
  return playerStats.achievements.some(a => a.id === achievementId);
}

/**
 * Show achievement notification
 */
function showAchievementNotification(achievement) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-content">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.description}</div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * Cleanup old games to free up space
 */
function cleanupOldGames(playerStats) {
  // Keep only last 20 games instead of 50
  if (playerStats.recentGames.length > 20) {
    playerStats.recentGames = playerStats.recentGames.slice(0, 20);
    console.log('Cleaned up old games');
  }
}

/**
 * Calculate win rate
 */
function getWinRate(playerStats) {
  if (!playerStats || playerStats.stats.totalGames === 0) {
    return 0;
  }

  return Math.round((playerStats.stats.wins / playerStats.stats.totalGames) * 100);
}

/**
 * Get recent games
 */
function getRecentGames(userId, limit = 10) {
  const playerStats = getPlayerStats(userId);
  if (!playerStats) return [];

  return playerStats.recentGames.slice(0, limit);
}

/**
 * Reset all stats (for testing or user request)
 */
function resetStats(userId) {
  if (!userId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    userId = currentUser.id;
  }

  const key = `chessStats_${userId}`;
  localStorage.removeItem(key);
  console.log('Stats reset for user:', userId);
  return true;
}

/**
 * Export stats as JSON (for backup)
 */
function exportStats(userId) {
  const playerStats = getPlayerStats(userId);
  if (!playerStats) return null;

  const dataStr = JSON.stringify(playerStats, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportName = `chess_stats_${userId}_${new Date().toISOString().split('T')[0]}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportName);
  linkElement.click();

  console.log('Stats exported');
  return true;
}

/**
 * Import stats from JSON (for restore)
 */
function importStats(jsonData) {
  try {
    const playerStats = JSON.parse(jsonData);

    // Validate structure
    if (!playerStats.userId || !playerStats.stats) {
      throw new Error('Invalid stats format');
    }

    savePlayerStats(playerStats);
    console.log('Stats imported successfully');
    return true;
  } catch (e) {
    console.error('Error importing stats:', e);
    return false;
  }
}

/**
 * Get formatted stats for display
 */
function getFormattedStats(userId) {
  const playerStats = getPlayerStats(userId);
  if (!playerStats) return null;

  const stats = playerStats.stats;
  const winRate = getWinRate(playerStats);

  return {
    elo: stats.elo,
    totalGames: stats.totalGames,
    record: `W ${stats.wins} L ${stats.losses} D ${stats.draws}`,
    winRate: `${winRate}%`,
    currentStreak: stats.currentStreak,
    bestStreak: stats.bestStreak,
    avgMoves: stats.averageMovesPerGame,
    lastPlayed: stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString() : 'Never'
  };
}
