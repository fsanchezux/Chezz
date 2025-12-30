// ============ MENU AND MODE SELECTION ============

var selectedGameMode = null;
var selectedMultiplayerColor = null;
var waitingForOpponent = false;
var bothPlayersConnected = false;

function selectGameMode(mode) {
  selectedGameMode = mode;
  if(mode === 'singleplayer') {
    showSinglePlayerNamesModal();
  } else if(mode === 'multiplayer') {
    showMultiplayerSetup();
  }
}

function showSinglePlayerNamesModal() {
  hideModal('mainMenuModal');
  showModal('singleplayerNamesModal');

  // Pre-select AI mode by default
  selectOpponentType('ai');

  // Pre-select white color by default
  selectPlayerColor('w');
}

function showMultiplayerSetup() {
  hideModal('mainMenuModal');
  showModal('multiplayerSetupModal');
}

function selectOpponentType(type) {
  var humanOption = document.getElementById('humanOption');
  var aiOption = document.getElementById('aiOption');
  var humanInputs = document.getElementById('humanPlayerInputs');
  var aiInputs = document.getElementById('aiPlayerInputs');

  if(type === 'human') {
    humanOption.classList.add('selected');
    aiOption.classList.remove('selected');
    humanInputs.style.display = 'block';
    aiInputs.style.display = 'none';
    window.isAIGame = false;
  } else {
    aiOption.classList.add('selected');
    humanOption.classList.remove('selected');
    humanInputs.style.display = 'none';
    aiInputs.style.display = 'block';
    window.isAIGame = true;
  }
}

function selectPlayerColor(color) {
  window.playerColor = color;
  window.aiColor = color === 'w' ? 'b' : 'w';

  var whiteBtn = document.getElementById('playAsWhite');
  var blackBtn = document.getElementById('playAsBlack');

  if(color === 'w') {
    whiteBtn.classList.remove('modal-btn-secondary');
    whiteBtn.classList.add('modal-btn-primary');
    blackBtn.classList.remove('modal-btn-primary');
    blackBtn.classList.add('modal-btn-secondary');
  } else {
    blackBtn.classList.remove('modal-btn-secondary');
    blackBtn.classList.add('modal-btn-primary');
    whiteBtn.classList.remove('modal-btn-primary');
    whiteBtn.classList.add('modal-btn-secondary');
  }
}

function confirmPlayerNames() {
  if(window.isAIGame) {
    var playerName = document.getElementById('playerNameInput').value.trim();

    if(!playerName) {
      showToast('Please enter your name');
      return;
    }

    if(window.playerColor === 'w') {
      window.player1Name = playerName;
      window.player2Name = '🤖 Computer';
    } else {
      window.player1Name = '🤖 Computer';
      window.player2Name = playerName;
    }

    document.getElementById('whitePlayerName').textContent = window.player1Name + ' (White)';
    document.getElementById('blackPlayerName').textContent = window.player2Name + ' (Black)';
  } else {
    var player1 = document.getElementById('player1NameInput').value.trim();
    var player2 = document.getElementById('player2NameInput').value.trim();

    if(!player1 || !player2) {
      showToast('Please enter both player names');
      return;
    }

    window.player1Name = player1;
    window.player2Name = player2;

    document.getElementById('whitePlayerName').textContent = player1 + ' (White)';
    document.getElementById('blackPlayerName').textContent = player2 + ' (Black)';
  }

  window.gameMode = 'singleplayer';
  window.side = 'w';

  hideModal('singleplayerNamesModal');
  hideMainMenu();
  startGame();

  // If AI game and AI is white, make first move
  if(window.isAIGame && window.aiColor === 'w') {
    setTimeout(makeRandomMove, 500);
  }
}

function selectMultiplayerColor(color) {
  selectedMultiplayerColor = color;
  var whiteBtn = document.getElementById('multiplayerWhiteBtn');
  var blackBtn = document.getElementById('multiplayerBlackBtn');

  if(color === 'w') {
    whiteBtn.classList.add('selected');
    whiteBtn.style.borderColor = 'var(--color-gold)';
    whiteBtn.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
    blackBtn.classList.remove('selected');
    blackBtn.style.borderColor = 'var(--color-border)';
    blackBtn.style.backgroundColor = 'rgba(0,0,0,0.3)';
  } else {
    blackBtn.classList.add('selected');
    blackBtn.style.borderColor = 'var(--color-gold)';
    blackBtn.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
    whiteBtn.classList.remove('selected');
    whiteBtn.style.borderColor = 'var(--color-border)';
    whiteBtn.style.backgroundColor = 'rgba(0,0,0,0.3)';
  }
}

function confirmMultiplayerSetup() {
  var username = document.getElementById('multiplayerUsernameInput').value.trim();

  if(!username) {
    showToast('Please enter your username');
    return;
  }

  if(!selectedMultiplayerColor) {
    showToast('Please select a color');
    return;
  }

  window.playerName = username;
  window.side = selectedMultiplayerColor;
  window.gameMode = 'multiplayer';

  hideModal('multiplayerSetupModal');
  startGame();

  // Join the room and send player info
  joinRoom(gameSessionId);
  setTimeout(function() {
    ws.send(JSON.stringify({ username: username, color: selectedMultiplayerColor }));
  }, 100);

  // Update room link display
  var roomLink = window.location.origin + window.location.pathname + '?room=' + gameSessionId;
  document.getElementById('roomLinkDisplay').textContent = roomLink;
  document.getElementById('roomLinkContainer').style.display = 'block';
}

function startGame() {
  // Show game container
  $('.container').show();

  // Re-render the board after container is visible
  // This ensures the board has proper dimensions
  setTimeout(function() {
    board.resize();
    board.position('start');
  }, 100);

  $('#resetBtn').show();
  $('#restartBtn').show();
  $('#turn').removeClass('hidden');
  updateTurnButton();

  if(window.side === 'b') {
    board.orientation('black');
  }

  // Initialize timers
  initializeTimers();

  // Initialize XP display
  updateXPDisplay();
  updateSkillButtons();
}

function toggle3RulesMode() {
  window.threeRulesEnabled = !window.threeRulesEnabled;
  var btn = document.getElementById('toggle3RulesBtn');

  if(window.threeRulesEnabled) {
    btn.classList.add('active');
    btn.textContent = '3 Rules Mode: ON';
    showToast('3 Rules Mode enabled');
  } else {
    btn.classList.remove('active');
    btn.textContent = '3 Rules Mode: OFF';
    showToast('3 Rules Mode disabled');
  }
}
