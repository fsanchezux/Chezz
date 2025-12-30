// ============ GAME LOGIC ============

var game = null;
var board = null;

// Game state
window.side = null;
window.playerName = '';
window.gameMode = null;
window.player1Name = '';
window.player2Name = '';
window.moveCount = 0;
window.moveHistory = [];
window.lastMove = null;
window.lastSquareTo = null;
window.lastSquareFrom = null;
window.restartRequested = false;
window.restartAccepted = false;

// 3 Rules mode state - ALWAYS ENABLED BY DEFAULT
window.threeRulesEnabled = true;
window.whitePawnCenter = false;
window.whiteKnightCenter = false;
window.whiteCastling = false;
window.whiteCanChangeOnce = false;
window.whiteHasUsedChange = false;
window.blackPawnCenter = false;
window.blackKnightCenter = false;
window.blackCastling = false;
window.blackCanChangeOnce = false;
window.blackHasUsedChange = false;

// AI game state
window.isAIGame = false;
window.playerColor = 'w';
window.aiColor = 'b';

// Initialize the chess game
function initChessGame() {
  game = new Chess();

  board = ChessBoard('board', {
    draggable: true,
    moveSpeed: 'fast',
    snapbackSpeed: 200,
    snapSpeed: 100,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
  });

  updateTurnButton();
}

// Chess board event handlers
function onSnapEnd() {
  board.position(game.fen());
}

function onDragStart(source, piece, position, orientation) {
  // If a skill is active, handle piece click for skill selection
  if(window.activeSkill) {
    handleSkillPieceClick(source);
    return false; // Prevent drag
  }

  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

function onDrop(source, target) {
  // Check if it's player's turn in multiplayer mode
  if(window.gameMode === 'multiplayer' && game.turn() !== window.side) {
    return 'snapback';
  }

  // AI game: only allow player to move their pieces
  if(window.isAIGame && game.turn() !== window.playerColor) {
    return 'snapback';
  }

  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  highlight(move);
  updateMoveHistory(move);

  // Handle skills system (XP and abilities)
  if(window.threeRulesEnabled) {
    handleSpecialMove(move);
  }

  // Switch timer to opponent
  switchTimer();

  // Send move to server in multiplayer mode
  if(window.gameMode === 'multiplayer') {
    sendMove(JSON.stringify(move));
  }

  // Check if game is over after this move
  checkGameEnd();

  // Make AI move if it's AI game
  if(window.isAIGame && game.turn() === window.aiColor) {
    setTimeout(makeRandomMove, 500);
  }

  return true;
}

// AI opponent - makes random legal move
function makeRandomMove() {
  var possibleMoves = game.moves();

  if (game.game_over() || possibleMoves.length === 0) return;

  var randomIdx = Math.floor(Math.random() * possibleMoves.length);
  var move = game.move(possibleMoves[randomIdx]);

  board.position(game.fen());
  highlight(move);
  updateMoveHistory(move);

  if(window.threeRulesEnabled) {
    handleSpecialMove(move);
  }

  // Switch timer back to player
  switchTimer();

  // Check if game is over after AI move
  checkGameEnd();
}

// Apply promotion
function applyPromotion(targetSquare, pieceType, color) {
  game.remove(targetSquare);
  game.put({type: pieceType, color: color}, targetSquare);
  board.position(game.fen());
}

// Apply special piece change
function applySpecialChange(specialChange) {
  game.remove(specialChange.square);
  var piece = board.position()[specialChange.square];
  if(piece) {
    var color = piece.color;
    game.put({type: specialChange.piece, color: color}, specialChange.square);
    board.position(game.fen());
  }
}

// Game control functions
function resetGame() {
  game = new Chess();
  board.position('start');
  window.gameMode = null;
  window.player1Name = '';
  window.player2Name = '';
  window.side = null;
  window.lastMove = null;
  window.lastSquareTo = null;
  window.lastSquareFrom = null;
  window.moveCount = 0;
  window.moveHistory = [];
  window.restartRequested = false;
  window.restartAccepted = false;

  // Reset skills and timers
  resetSkillsState();
  stopAllTimers();

  $('#join').addClass('hidden');
  $('#username').addClass('hidden');
  $('#names').addClass('hidden');
  $('#turn').addClass('hidden');
  $('#resetBtn').hide();
  $('#restartBtn').hide();
  $('#restartRequest').addClass('hidden');
  $('#moveCounter').html('0');
  $('#moveHistory').html('');
  board.orientation('white');

  showModal('mainMenuModal');
}

function restartGame() {
  if(window.gameMode === 'singleplayer') {
    performRestart();
  } else if(window.gameMode === 'multiplayer') {
    window.restartRequested = true;
    window.restartAccepted = false;
    ws.send(JSON.stringify({restartRequest: true, player: window.playerName}));
    showToast('Restart request sent. Waiting for opponent confirmation...');
  }
}

function performRestart() {
  game = new Chess();
  board.position('start');
  window.lastMove = null;
  window.lastSquareTo = null;
  window.lastSquareFrom = null;
  window.restartRequested = false;
  window.restartAccepted = false;
  window.moveCount = 0;
  window.moveHistory = [];

  // Reset skills and timers
  resetSkillsState();
  resetTimers();
  initializeTimers();

  $('#moveCounter').html('0');
  $('#moveHistory').html('');
  $('#restartRequest').addClass('hidden');
  updateTurnButton();
}

function acceptRestart() {
  window.restartAccepted = true;
  $('#restartRequest').addClass('hidden');
  ws.send(JSON.stringify({restartAccepted: true, player: window.playerName}));

  if(window.restartRequested && window.restartAccepted) {
    performRestart();
  }
}

function rejectRestart() {
  window.restartRequested = false;
  window.restartAccepted = false;
  $('#restartRequest').addClass('hidden');
  ws.send(JSON.stringify({restartRejected: true, player: window.playerName}));
  showToast('Restart rejected');
}

function flipBoard() {
  board.flip();
}

// Check if game has ended and record stats
function checkGameEnd() {
  if (!game.game_over()) {
    return;
  }

  var currentUser = getCurrentUser();
  if (!currentUser) {
    console.log('No user logged in, skipping stats');
    return;
  }

  var endReason = '';
  var result = '';
  var playerColor = '';
  var opponentName = '';

  // Determine end reason
  if (game.in_checkmate()) {
    endReason = 'checkmate';
  } else if (game.in_stalemate()) {
    endReason = 'stalemate';
  } else if (game.in_threefold_repetition()) {
    endReason = 'threefold_repetition';
  } else if (game.insufficient_material()) {
    endReason = 'insufficient_material';
  } else if (game.in_draw()) {
    endReason = 'draw';
  }

  // Determine result based on game mode
  if (window.gameMode === 'singleplayer') {
    if (window.isAIGame) {
      // Playing vs AI
      playerColor = window.playerColor;
      opponentName = 'Computer';

      if (game.in_checkmate()) {
        // The player who just moved won (it's the other player's turn when checkmate happens)
        var winner = game.turn() === 'w' ? 'b' : 'w';
        result = winner === playerColor ? 'win' : 'loss';
      } else {
        result = 'draw';
      }
    } else {
      // Playing vs human locally
      // For local 2-player, we can only track from one perspective
      // Let's consider the current user as player 1 (white)
      playerColor = 'w';
      opponentName = window.player2Name || 'Player 2';

      if (game.in_checkmate()) {
        var winner = game.turn() === 'w' ? 'b' : 'w';
        result = winner === 'w' ? 'win' : 'loss';
      } else {
        result = 'draw';
      }
    }
  } else if (window.gameMode === 'multiplayer') {
    // Online multiplayer
    playerColor = window.side;
    opponentName = 'Online Opponent';

    if (game.in_checkmate()) {
      var winner = game.turn() === 'w' ? 'b' : 'w';
      result = winner === playerColor ? 'win' : 'loss';
    } else {
      result = 'draw';
    }
  }

  // Get PGN (simplified version)
  var pgn = window.moveHistory.join(', ');

  // Record the game
  var gameData = {
    opponent: opponentName,
    opponentType: window.isAIGame ? 'ai' : 'human',
    result: result,
    color: playerColor === 'w' ? 'white' : 'black',
    moves: window.moveCount,
    pgn: pgn,
    gameMode: window.gameMode,
    endReason: endReason
  };

  recordGame(gameData);

  // Show game over message
  var message = '';
  if (result === 'win') {
    message = '🎉 Congratulations! You won by ' + endReason + '!';
  } else if (result === 'loss') {
    message = '😔 You lost by ' + endReason + '. Better luck next time!';
  } else {
    message = '🤝 Game drawn by ' + endReason + '.';
  }

  setTimeout(function() {
    showToast(message, 5000);
    // Update the user badge with new stats
    updateUserBadge(currentUser);
  }, 1000);

  console.log('Game ended:', result, endReason);
}
