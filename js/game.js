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
window.aiELO = 1200; // Default to Intermediate (800=Beginner, 1200=Intermediate, 1600=Advanced, 2000=Expert)

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

  // Make AI move if it's AI game (but wait if player has skill modal open)
  if(window.isAIGame && game.turn() === window.aiColor) {
    // Check if skill2UnlockModal is open
    var skill2Modal = document.getElementById('skill2UnlockModal');
    if(skill2Modal && skill2Modal.classList.contains('active')) {
      // Wait for player to choose skill before AI moves
      waitForSkillChoiceThenAIMove();
    } else {
      setTimeout(makeRandomMove, 500);
    }
  }

  return true;
}

// Wait for player to choose skill, then let AI move
function waitForSkillChoiceThenAIMove() {
  var checkInterval = setInterval(function() {
    var skill2Modal = document.getElementById('skill2UnlockModal');
    if(!skill2Modal || !skill2Modal.classList.contains('active')) {
      clearInterval(checkInterval);
      setTimeout(makeRandomMove, 500);
    }
  }, 100);
}

// AI opponent - makes move based on ELO level
function makeRandomMove() {
  var possibleMoves = game.moves({verbose: true});

  if (game.game_over() || possibleMoves.length === 0) return;

  // AI may use skills before moving (probability based on ELO)
  var skillChance = getSkillUsageChance();
  if(window.threeRulesEnabled && Math.random() < skillChance) {
    tryAIUseSkill();
  }

  var selectedMove = selectAIMove(possibleMoves);
  var move = game.move(selectedMove);

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

// Get skill usage chance based on ELO
function getSkillUsageChance() {
  if(window.aiELO >= 2000) return 0.5; // Expert: 50% chance
  if(window.aiELO >= 1600) return 0.4; // Advanced: 40% chance
  if(window.aiELO >= 1200) return 0.3; // Intermediate: 30% chance
  return 0.15; // Beginner: 15% chance
}

// Select move based on AI ELO level
function selectAIMove(possibleMoves) {
  var elo = window.aiELO || 1200;

  // ELO 800 - Beginner: Mostly random, sometimes makes obvious mistakes
  if(elo <= 800) {
    // 20% chance to make a bad move intentionally
    if(Math.random() < 0.2) {
      return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
    // 80% chance to make a decent move
    return selectDecentMove(possibleMoves);
  }

  // ELO 1200 - Intermediate: Balanced play, looks for captures
  if(elo <= 1200) {
    // 70% chance to pick good move, 30% random
    if(Math.random() < 0.7) {
      return selectGoodMove(possibleMoves);
    }
    return selectDecentMove(possibleMoves);
  }

  // ELO 1600 - Advanced: Strong tactical play
  if(elo <= 1600) {
    // 85% chance to pick best move, 15% good move
    if(Math.random() < 0.85) {
      return selectBestMove(possibleMoves);
    }
    return selectGoodMove(possibleMoves);
  }

  // ELO 2000 - Expert: Nearly perfect play
  // 95% chance to pick best move, 5% good move
  if(Math.random() < 0.95) {
    return selectBestMove(possibleMoves);
  }
  return selectGoodMove(possibleMoves);
}

// Select a decent move (avoids hanging pieces)
function selectDecentMove(possibleMoves) {
  // Filter out moves that hang pieces
  var safeMoves = possibleMoves.filter(function(move) {
    var testGame = new Chess(game.fen());
    testGame.move(move);
    // Simple check: don't leave pieces hanging
    return !isMoveLeavingPieceHanging(testGame, move);
  });

  if(safeMoves.length > 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
}

// Select a good move (prioritizes captures and checks)
function selectGoodMove(possibleMoves) {
  // Prioritize: 1) Checkmate, 2) Checks, 3) Captures, 4) Development
  var checkmates = possibleMoves.filter(function(move) {
    var testGame = new Chess(game.fen());
    testGame.move(move);
    return testGame.in_checkmate();
  });
  if(checkmates.length > 0) return checkmates[0];

  var checks = possibleMoves.filter(function(move) {
    var testGame = new Chess(game.fen());
    testGame.move(move);
    return testGame.in_check();
  });

  var captures = possibleMoves.filter(function(move) {
    return move.captured;
  });

  // 50% prefer checks if available
  if(checks.length > 0 && Math.random() < 0.5) {
    return checks[Math.floor(Math.random() * checks.length)];
  }

  // Otherwise prefer captures
  if(captures.length > 0) {
    return captures[Math.floor(Math.random() * captures.length)];
  }

  return selectDecentMove(possibleMoves);
}

// Select the best move (evaluates position)
function selectBestMove(possibleMoves) {
  // Prioritize: 1) Checkmate, 2) Best captures, 3) Checks, 4) Positional
  var checkmates = possibleMoves.filter(function(move) {
    var testGame = new Chess(game.fen());
    testGame.move(move);
    return testGame.in_checkmate();
  });
  if(checkmates.length > 0) return checkmates[0];

  // Evaluate captures by piece value
  var pieceValues = {p: 1, n: 3, b: 3, r: 5, q: 9, k: 0};
  var captures = possibleMoves.filter(function(move) {
    return move.captured;
  }).sort(function(a, b) {
    return pieceValues[b.captured] - pieceValues[a.captured];
  });

  // Take best capture if it's good
  if(captures.length > 0 && pieceValues[captures[0].captured] >= 3) {
    return captures[0];
  }

  // Check for checks that lead to advantage
  var checks = possibleMoves.filter(function(move) {
    var testGame = new Chess(game.fen());
    testGame.move(move);
    return testGame.in_check();
  });

  if(checks.length > 0 && Math.random() < 0.7) {
    return checks[0];
  }

  // Otherwise take any good capture or random good move
  if(captures.length > 0) {
    return captures[0];
  }

  return selectGoodMove(possibleMoves);
}

// Simple check if move leaves piece hanging
function isMoveLeavingPieceHanging(testGame, move) {
  // Very basic implementation - just check if the moved piece is now attacked
  // This is simplified; a real engine would do much more
  return false; // For now, assume moves don't hang pieces
}

// AI tries to use available skills
function tryAIUseSkill() {
  var aiColor = window.aiColor;
  var colorCode = aiColor === 'w' ? 'w' : 'b';

  // Check which skills are available and not used
  var availableSkills = [];

  if(colorCode === 'w') {
    if(window.whiteSkill1Available && !window.whiteSkill1Used) {
      availableSkills.push(1);
    }
    if(window.whiteSkill2Available && window.whiteSkill2Choice === 'freeze' && !window.whiteSkill2Used) {
      availableSkills.push(2);
    }
    if(window.whiteSkill3Available && !window.whiteSkill3Used) {
      availableSkills.push(3);
    }
  } else {
    if(window.blackSkill1Available && !window.blackSkill1Used) {
      availableSkills.push(1);
    }
    if(window.blackSkill2Available && window.blackSkill2Choice === 'freeze' && !window.blackSkill2Used) {
      availableSkills.push(2);
    }
    if(window.blackSkill3Available && !window.blackSkill3Used) {
      availableSkills.push(3);
    }
  }

  if(availableSkills.length === 0) return;

  // AI randomly picks a skill to use
  var skillToUse = availableSkills[Math.floor(Math.random() * availableSkills.length)];

  if(skillToUse === 1) {
    aiUseSkill1(colorCode);
  } else if(skillToUse === 2) {
    executeSkill2Freeze(colorCode);
  } else if(skillToUse === 3) {
    aiUseSkill3(colorCode);
  }
}

// AI uses Skill 1 (Random Transform)
function aiUseSkill1(color) {
  var position = board.position();
  var validPieces = [];

  // Find all AI pieces that can be transformed (not king)
  for(var square in position) {
    var piece = position[square];
    if(piece && piece.charAt(0) === color && piece.charAt(1) !== 'K') {
      validPieces.push(square);
    }
  }

  if(validPieces.length === 0) return;

  // Pick a random piece
  var randomSquare = validPieces[Math.floor(Math.random() * validPieces.length)];

  // Execute skill without modal
  var isUpgraded = color === 'w' ? window.whiteSkill1Upgraded : window.blackSkill1Upgraded;
  var pieces = isUpgraded ? ['b', 'n', 'r'] : ['b', 'n'];
  var randomPiece = pieces[Math.floor(Math.random() * pieces.length)];

  // Transform the piece
  game.remove(randomSquare);
  game.put({type: randomPiece, color: color}, randomSquare);

  // Force update the FEN and reload to ensure consistency
  var newFEN = game.fen();
  game.load(newFEN);
  board.position(newFEN);

  // Mark as used
  if(color === 'w') {
    window.whiteSkill1Used = true;
  } else {
    window.blackSkill1Used = true;
  }

  updateSkillButtons();

  var pieceNames = {b: 'Bishop', n: 'Knight', r: 'Rook'};
  var colorName = color === 'w' ? 'White' : 'Black';
  showToast('🤖 ' + colorName + ' AI used Skill 1: Transformed to ' + pieceNames[randomPiece] + '!', 3000);
}

// AI uses Skill 3 (Queen Transform)
function aiUseSkill3(color) {
  var position = board.position();
  var validPieces = [];

  // Find all AI pieces that can be transformed (not king or queen)
  for(var square in position) {
    var piece = position[square];
    if(piece && piece.charAt(0) === color && piece.charAt(1) !== 'K' && piece.charAt(1) !== 'Q') {
      validPieces.push(square);
    }
  }

  if(validPieces.length === 0) return;

  // Pick a random piece (prefer pawns, rooks, bishops, knights)
  var randomSquare = validPieces[Math.floor(Math.random() * validPieces.length)];

  // Transform the piece
  game.remove(randomSquare);
  game.put({type: 'q', color: color}, randomSquare);

  // Force update the FEN and reload to ensure consistency
  var newFEN = game.fen();
  game.load(newFEN);
  board.position(newFEN);

  // Mark as used
  if(color === 'w') {
    window.whiteSkill3Used = true;
  } else {
    window.blackSkill3Used = true;
  }

  updateSkillButtons();

  var colorName = color === 'w' ? 'White' : 'Black';
  showToast('🤖 ' + colorName + ' AI used Skill 3: Transformed to Queen!', 3000);
}

// Apply promotion
function applyPromotion(targetSquare, pieceType, color) {
  game.remove(targetSquare);
  game.put({type: pieceType, color: color}, targetSquare);

  // Force update the FEN and reload to ensure consistency
  var newFEN = game.fen();
  game.load(newFEN);
  board.position(newFEN);
}

// Apply special piece change
function applySpecialChange(specialChange) {
  game.remove(specialChange.square);
  var piece = board.position()[specialChange.square];
  if(piece) {
    var color = piece.color;
    game.put({type: specialChange.piece, color: color}, specialChange.square);

    // Force update the FEN and reload to ensure consistency
    var newFEN = game.fen();
    game.load(newFEN);
    board.position(newFEN);
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
