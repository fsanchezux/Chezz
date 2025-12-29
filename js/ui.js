// ============ UI UTILITIES ============

// Toast notification system
var toastQueue = [];
var toastShowing = false;

function showToast(message, duration) {
  if(!duration) duration = 3000;
  toastQueue.push({message: message, duration: duration});
  if(!toastShowing) {
    showNextToast();
  }
}

function showNextToast() {
  if(toastQueue.length === 0) {
    toastShowing = false;
    return;
  }

  toastShowing = true;
  var toast = toastQueue.shift();

  // Create toast element
  var toastEl = document.createElement('div');
  toastEl.className = 'toast-notification';
  toastEl.textContent = toast.message;
  document.body.appendChild(toastEl);

  // Trigger animation
  setTimeout(function() {
    toastEl.classList.add('show');
  }, 10);

  // Remove after duration
  setTimeout(function() {
    toastEl.classList.remove('show');
    setTimeout(function() {
      document.body.removeChild(toastEl);
      showNextToast();
    }, 300);
  }, toast.duration);
}

// Loading screen management
function showLoadingScreen() {
  var loadingScreen = document.getElementById('loadingScreen');
  if(loadingScreen) {
    loadingScreen.style.display = 'flex';
  }
}

function hideLoadingScreen() {
  var loadingScreen = document.getElementById('loadingScreen');
  if(loadingScreen) {
    loadingScreen.classList.add('fade-out');
    setTimeout(function() {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// Show/hide modals
function showModal(modalId) {
  var modal = document.getElementById(modalId);
  if(modal) {
    modal.classList.add('active');
  }
}

function hideModal(modalId) {
  var modal = document.getElementById(modalId);
  if(modal) {
    modal.classList.remove('active');
  }
}

// Update turn indicator
function updateTurnButton() {
  var turnElement = document.getElementById('turn');
  if(!turnElement) return;

  if(game.turn() === 'w') {
    turnElement.classList.remove('hidden');
    turnElement.innerHTML = "White's turn!";
    turnElement.classList.remove('label-black');
    turnElement.classList.add('label-white');
  } else if(game.turn() === 'b') {
    turnElement.classList.remove('hidden');
    turnElement.innerHTML = "Black's turn!";
    turnElement.classList.remove('label-white');
    turnElement.classList.add('label-black');
  }
}

// Highlight squares
function highlight(move) {
  if(move) {
    var squareTo = $('#board').find('.square-' + move.to);
    var squareFrom = $('#board').find('.square-' + move.from);

    if(window.lastSquareTo) {
      window.lastSquareTo.removeClass('highlight-black');
      window.lastSquareTo.removeClass('highlight-white');
    }
    if(window.lastSquareFrom) {
      window.lastSquareFrom.removeClass('highlight-black');
      window.lastSquareFrom.removeClass('highlight-white');
    }

    window.lastSquareTo = squareTo;
    window.lastSquareFrom = squareFrom;
    squareTo.addClass(squareTo.hasClass('black-3c85d') ? 'highlight-black' : 'highlight-white');
    squareFrom.addClass(squareFrom.hasClass('black-3c85d') ? 'highlight-black' : 'highlight-white');
    window.lastMove = move;
    updateTurnButton();
  }
}

// Update move history display
function updateMoveHistory(move) {
  window.moveCount++;
  var moveNotation = move.from + ' → ' + move.to;

  if(move.captured) {
    moveNotation += ' (captures ' + move.captured + ')';
  }
  if(move.promotion) {
    moveNotation += ' (promotes to ' + move.promotion + ')';
  }

  window.moveHistory.push(moveNotation);

  // Update counter
  $('#moveCounter').html(window.moveCount);

  // Add move to visual history
  var moveElement = '<div style="padding: 5px; border-bottom: 1px solid #555;">' +
                   '<strong>' + window.moveCount + '.</strong> ' + moveNotation +
                   '</div>';
  $('#moveHistory').append(moveElement);

  // Scroll to bottom
  var moveHistoryDiv = $('#moveHistory');
  moveHistoryDiv.scrollTop(moveHistoryDiv[0].scrollHeight);
}

// Copy room link to clipboard
function copyRoomLink() {
  var roomLink = window.location.origin + window.location.pathname + '?room=' + gameSessionId;
  navigator.clipboard.writeText(roomLink).then(function() {
    showToast('Room link copied to clipboard!');
  }).catch(function(err) {
    console.error('Failed to copy: ', err);
    showToast('Failed to copy room link');
  });
}

// Show/hide main menu screen
function showMainMenu() {
  var mainMenuScreen = document.getElementById('mainMenuScreen');
  if(mainMenuScreen) {
    mainMenuScreen.style.display = 'flex';
  }
}

function hideMainMenu() {
  var mainMenuScreen = document.getElementById('mainMenuScreen');
  if(mainMenuScreen) {
    mainMenuScreen.style.display = 'none';
  }
}
