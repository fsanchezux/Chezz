// ============ CHESS TIMER SYSTEM ============

// Timer variables
window.whiteTimeRemaining = 300; // 5 minutes in seconds
window.blackTimeRemaining = 300; // 5 minutes in seconds
window.whiteTimerInterval = null;
window.blackTimerInterval = null;
window.whiteTimerFrozen = false;
window.blackTimerFrozen = false;
window.currentTurn = 'w'; // Track whose turn it is

// Initialize timers when game starts
function initializeTimers() {
  window.whiteTimeRemaining = 300;
  window.blackTimeRemaining = 300;
  window.whiteTimerFrozen = false;
  window.blackTimerFrozen = false;
  window.currentTurn = 'w';

  updateTimerDisplay('white');
  updateTimerDisplay('black');

  // Initialize board color
  updateBoardColor('white', window.whiteTimeRemaining);

  // Start white's timer first
  startTimer('white');
}

// Format time as MM:SS
function formatTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  var secs = seconds % 60;
  return minutes + ':' + (secs < 10 ? '0' : '') + secs;
}

// Update timer display
function updateTimerDisplay(color) {
  var timerElement = document.getElementById(color + 'Timer');
  var timeRemaining = color === 'white' ? window.whiteTimeRemaining : window.blackTimeRemaining;

  if(timerElement) {
    timerElement.textContent = formatTime(timeRemaining);

    // Change color when running low on time
    if(timeRemaining <= 30) {
      timerElement.style.color = '#ff4444';
      if(timeRemaining <= 10) {
        timerElement.style.animation = 'timerBlink 0.5s ease-in-out infinite';
      }
    } else if(timeRemaining <= 60) {
      timerElement.style.color = '#ffaa00';
    } else {
      timerElement.style.color = 'var(--color-gold)';
      timerElement.style.animation = 'none';
    }
  }

  // Update board color based on current player's time
  updateBoardColor(color, timeRemaining);
}

// Update board color based on remaining time
function updateBoardColor(color, timeRemaining) {
  // Only update board color for the current player
  var isCurrentPlayer = (color === 'white' && window.currentTurn === 'w') ||
                        (color === 'black' && window.currentTurn === 'b');

  if(!isCurrentPlayer) {
    return;
  }

  var initialTime = 300; // 5 minutes in seconds
  var percentage = (timeRemaining / initialTime) * 100;
  var boardColor;

  // Determine color based on percentage
  if(percentage > 80) {
    boardColor = 'var(--Chessvetica--Annotation--LightBlue)'; // Azul fuerte
  } else if(percentage > 40) {
    boardColor = 'var(--Chessvetica--Annotation--Green)'; // Verde
  }  else if(percentage > 10) {
    boardColor = 'var(--Chessvetica--Annotation--Orange)'; // Naranja
  } else {
    boardColor = 'var(--Chessvetica--Annotation--Red)'; // Rojo
  }

  // Apply the color to the board
  applyBoardColor(boardColor);
}

// Apply color to board squares
function applyBoardColor(color) {
  // Update CSS custom property for dynamic board coloring
  document.documentElement.style.setProperty('--board-color-dynamic', color);
}

// Start a player's timer
function startTimer(color) {
  // Stop both timers first
  stopAllTimers();

  var isFrozen = color === 'white' ? window.whiteTimerFrozen : window.blackTimerFrozen;

  if(isFrozen) {
    console.log(color + ' timer is frozen, not starting');
    return;
  }

  if(color === 'white') {
    window.whiteTimerInterval = setInterval(function() {
      if(!window.whiteTimerFrozen) {
        window.whiteTimeRemaining--;
        updateTimerDisplay('white');

        if(window.whiteTimeRemaining <= 0) {
          stopAllTimers();
          handleTimeOut('white');
        }
      }
    }, 1000);
  } else {
    window.blackTimerInterval = setInterval(function() {
      if(!window.blackTimerFrozen) {
        window.blackTimeRemaining--;
        updateTimerDisplay('black');

        if(window.blackTimeRemaining <= 0) {
          stopAllTimers();
          handleTimeOut('black');
        }
      }
    }, 1000);
  }
}

// Stop all timers
function stopAllTimers() {
  if(window.whiteTimerInterval) {
    clearInterval(window.whiteTimerInterval);
    window.whiteTimerInterval = null;
  }
  if(window.blackTimerInterval) {
    clearInterval(window.blackTimerInterval);
    window.blackTimerInterval = null;
  }
}

// Switch turn (called after each move)
function switchTimer() {
  window.currentTurn = window.currentTurn === 'w' ? 'b' : 'w';
  var color = window.currentTurn === 'w' ? 'white' : 'black';
  var timeRemaining = color === 'white' ? window.whiteTimeRemaining : window.blackTimeRemaining;

  // Update board color for new player
  updateBoardColor(color, timeRemaining);

  startTimer(color);
}

// Handle timeout
function handleTimeOut(color) {
  var winner = color === 'white' ? 'Black' : 'White';
  showToast('⏰ ' + color.toUpperCase() + ' ran out of time! ' + winner + ' wins!', 7000);

  // End the game
  if(game) {
    // Force a game over state (you might want to handle this differently)
    console.log(color + ' lost on time');
  }
}

// Freeze a player's timer (Skill 2 ability)
function freezeTimer(color, duration) {
  if(color === 'white') {
    window.whiteTimerFrozen = true;
    showToast('⏸️ White timer frozen for ' + duration + ' seconds!', 3000);

    setTimeout(function() {
      window.whiteTimerFrozen = false;
      showToast('▶️ White timer unfrozen!', 3000);
    }, duration * 1000);
  } else {
    window.blackTimerFrozen = true;
    showToast('⏸️ Black timer frozen for ' + duration + ' seconds!', 3000);

    setTimeout(function() {
      window.blackTimerFrozen = false;
      showToast('▶️ Black timer unfrozen!', 3000);
    }, duration * 1000);
  }
}

// Reset timers when restarting game
function resetTimers() {
  stopAllTimers();
  window.whiteTimeRemaining = 300;
  window.blackTimeRemaining = 300;
  window.whiteTimerFrozen = false;
  window.blackTimerFrozen = false;
  window.currentTurn = 'w';
  updateTimerDisplay('white');
  updateTimerDisplay('black');

  // Reset board color to initial state
  updateBoardColor('white', window.whiteTimeRemaining);
}
