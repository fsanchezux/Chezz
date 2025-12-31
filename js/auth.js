// ============ AUTHENTICATION SYSTEM ============

// Google OAuth Configuration
// NOTA: Necesitas reemplazar este CLIENT_ID con tu propio ID de cliente de Google
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

// Session management
let currentUser = null;

/**
 * Initialize Google Sign-In
 */
function initializeGoogleAuth() {
  // Check if Google Identity Services is available
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false
    });
  } else {
    console.warn('Google Identity Services not loaded');
  }
}

/**
 * Check if user has an active session
 */
function checkSession() {
  // Check localStorage for saved session
  const savedUser = localStorage.getItem('chessUser');

  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      console.log('Session found:', currentUser.name);
      return true;
    } catch (e) {
      console.error('Error parsing saved session:', e);
      localStorage.removeItem('chessUser');
      return false;
    }
  }

  return false;
}

/**
 * Show authentication modal
 */
function showAuthModal() {
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.add('active');
  }
}

/**
 * Hide authentication modal
 */
function hideAuthModal() {
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.remove('active');
  }
}

/**
 * Handle Google Sign-In response
 */
function handleGoogleSignIn(response) {
  try {
    // Decode JWT token to get user info
    const userInfo = parseJwt(response.credential);

    currentUser = {
      id: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      provider: 'google'
    };

    // Save session to localStorage
    localStorage.setItem('chessUser', JSON.stringify(currentUser));

    console.log('Google Sign-In successful:', currentUser.name);

    // Hide auth modal and show main menu
    hideAuthModal();
    showMainMenu();

    // Update user badge with real data
    updateUserBadge(currentUser);

    // Initialize or load stats
    getPlayerStats(currentUser.id);

  } catch (error) {
    console.error('Error handling Google sign-in:', error);
    alert('Error signing in with Google. Please try again.');
  }
}

/**
 * Sign in with Google button click handler
 */
function signInWithGoogle() {
  alert("Not implemented");
  return
  if (typeof google !== 'undefined' && google.accounts) {
    // Use Google One Tap or redirect to OAuth flow
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: open popup for sign-in
        console.log('One Tap not available, using popup');
        // You can implement a popup flow here if needed
      }
    });
  } else {
    console.error('Google Identity Services not loaded');
    alert('Google Sign-In is not available. Please try again later or continue as guest.');
  }
}

/**
 * Continue as guest
 */
function continueAsGuest() {
  currentUser = {
    id: 'guest_' + Date.now(),
    name: 'Guest Player',
    email: null,
    picture: null,
    provider: 'guest'
  };

  // Save guest session
  localStorage.setItem('chessUser', JSON.stringify(currentUser));

  console.log('Continuing as guest');

  // Hide auth modal and show main menu
  hideAuthModal();
  showMainMenu();

  // Update user badge
  updateUserBadge(currentUser);

  // Initialize or load stats
  getPlayerStats(currentUser.id);
}

/**
 * Sign out user
 */
function signOut() {
  // Clear session
  currentUser = null;
  localStorage.removeItem('chessUser');

  // Sign out from Google if applicable
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect();
  }

  console.log('User signed out');

  // Reload page to show auth modal again
  location.reload();
}

/**
 * Update user badge with authenticated user info
 */
function updateUserBadge(user) {
  const userBadge = document.querySelector('.user-badge');
  if (!userBadge) return;

  // Update user name
  const userTitle = userBadge.querySelector('.user-badge-title');
  if (userTitle) {
    userTitle.textContent = user.id || 'Guest Player';
  }

  // Update icon if user has a profile picture
  const userIcon = userBadge.querySelector('.user-badge-icon');
  if (userIcon && user.picture) {
    userIcon.style.backgroundImage = `url('${user.picture}')`;
    userIcon.style.backgroundSize = 'cover';
    userIcon.style.backgroundPosition = 'center';
    userIcon.textContent = '';
    userIcon.style.borderRadius = '50%';
  }

  // Update stats
  const stats = getFormattedStats(user.id);
  if (stats) {
    
    
    const userBadgeElo = userBadge.querySelector('.user-badge-elo');
    if (userBadgeElo) {
      userBadgeElo.textContent = `ELO ${stats.elo}`;
    }

//const userBadgeStats = userBadge.querySelector('.user-badge-elo');
  //  if (userBadgeStats) {
    //  userBadgeStats.textContent = stats.record;
    //}
  }
}

/**
 * Parse JWT token to get user info
 */
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

/**
 * Get current user
 */
function getCurrentUser() {
  return currentUser;
}

// Initialize Google Auth when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGoogleAuth);
} else {
  initializeGoogleAuth();
}
