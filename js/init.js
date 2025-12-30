// ============ APPLICATION INITIALIZATION ============

// This file coordinates the initialization of all components

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Chess Application...');

  // Show loading screen
  showLoadingScreen();

  // Step 1: Load theme preference
  loadThemePreference();

  // Step 2: Initialize WebSocket connection
  initializeWebSocket();

  // Step 3: Initialize chess game and board
  initChessGame();

  // Step 4: Check authentication and show appropriate screen
  // Wait 3 seconds for the fill animation to complete (2.5s animation + 0.5s buffer)
  setTimeout(function() {
    hideLoadingScreen();

    // Check if user has an active session
    if (checkSession()) {
      // User is authenticated, show main menu
      console.log('User authenticated, showing main menu');
      showMainMenu();

      // Update user badge with saved user data
      const currentUser = getCurrentUser();
      if (currentUser) {
        updateUserBadge(currentUser);
      }
    } else {
      // No session found, show auth modal
      console.log('No session found, showing auth modal');
      showAuthModal();
    }
  }, 3000);

  console.log('Chess Application initialized successfully');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    console.log('Page hidden');
  } else {
    console.log('Page visible');
    // Reconnect if needed
    if(ws && ws.readyState !== WebSocket.OPEN) {
      console.log('Reconnecting WebSocket...');
      initializeWebSocket();
    }
  }
});

// Handle window unload
window.addEventListener('beforeunload', function(e) {
  if(window.gameMode === 'multiplayer' && ws && ws.readyState === WebSocket.OPEN) {
    // Warn user they're leaving an active game
    e.preventDefault();
    e.returnValue = '';
  }
});
