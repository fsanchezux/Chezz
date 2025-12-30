// ============ SKILLS SYSTEM - XP BASED ============

// XP System variables
window.whiteXP = 0;
window.blackXP = 0;

// Skill availability flags
window.whiteSkill1Available = false;
window.whiteSkill2Available = false;
window.whiteSkill3Available = false;
window.blackSkill1Available = false;
window.blackSkill2Available = false;
window.blackSkill3Available = false;

// Skill usage flags (can only use once)
window.whiteSkill1Used = false;
window.whiteSkill2Used = false;
window.whiteSkill3Used = false;
window.blackSkill1Used = false;
window.blackSkill2Used = false;
window.blackSkill3Used = false;

// Skill 2 choice (null = not chosen, 'freeze' = freeze timer, 'upgrade' = upgrade skill1)
window.whiteSkill2Choice = null;
window.blackSkill2Choice = null;

// Skill 1 upgraded flag
window.whiteSkill1Upgraded = false;
window.blackSkill1Upgraded = false;

// Active skill selection state
window.activeSkill = null; // {skill: 1/2/3, color: 'w'/'b'}

// XP Thresholds
const XP_SKILL_1 = 21;  // Early game - random bishop/knight (or +rook if upgraded)
const XP_SKILL_2 = 41;  // Mid game - choose between freeze timer or upgrade skill 1
const XP_SKILL_3 = 90;  // End game - change any piece to queen

// XP rewards
const XP_PER_MOVE = 3;
const XP_PER_CAPTURE = 1.5;

// Update XP display
function updateXPDisplay() {
  var whiteXPDisplay = document.getElementById('whiteXPDisplay');
  var blackXPDisplay = document.getElementById('blackXPDisplay');

  if(whiteXPDisplay) {
    whiteXPDisplay.textContent = 'XP: ' + Math.floor(window.whiteXP);
  }
  if(blackXPDisplay) {
    blackXPDisplay.textContent = 'XP: ' + Math.floor(window.blackXP);
  }

  // Update skill button availability
  updateSkillButtons();
}

// Add XP for a move
function addXP(move) {
  var xpGained = XP_PER_MOVE;

  // Extra XP for captures
  if(move.captured) {
    xpGained += XP_PER_CAPTURE;
  }

  // Add to the correct player
  if(move.color === 'w') {
    window.whiteXP += xpGained;
    checkSkillUnlocks('w');
  } else {
    window.blackXP += xpGained;
    checkSkillUnlocks('b');
  }

  updateXPDisplay();

  // Send XP update in multiplayer mode
  if(window.gameMode === 'multiplayer' && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      xpUpdate: true,
      whiteXP: window.whiteXP,
      blackXP: window.blackXP
    }));
  }
}

// Check if player unlocked new skills
function checkSkillUnlocks(color) {
  if(color === 'w') {
    if(window.whiteXP >= XP_SKILL_1 && !window.whiteSkill1Available) {
      window.whiteSkill1Available = true;
      showToast('⚡ White unlocked Skill 1: Random Transform!', 5000);
    }
    if(window.whiteXP >= XP_SKILL_2 && !window.whiteSkill2Available) {
      window.whiteSkill2Available = true;
      // Show choice modal immediately
      showSkill2UnlockModal('w');
    }
    if(window.whiteXP >= XP_SKILL_3 && !window.whiteSkill3Available) {
      window.whiteSkill3Available = true;
      showToast('⚡ White unlocked Skill 3: Queen Transform!', 5000);
    }
  } else {
    if(window.blackXP >= XP_SKILL_1 && !window.blackSkill1Available) {
      window.blackSkill1Available = true;
      showToast('⚡ Black unlocked Skill 1: Random Transform!', 5000);
    }
    if(window.blackXP >= XP_SKILL_2 && !window.blackSkill2Available) {
      window.blackSkill2Available = true;
      // Show choice modal immediately
      showSkill2UnlockModal('b');
    }
    if(window.blackXP >= XP_SKILL_3 && !window.blackSkill3Available) {
      window.blackSkill3Available = true;
      showToast('⚡ Black unlocked Skill 3: Queen Transform!', 5000);
    }
  }
}

// Update skill button states
function updateSkillButtons() {
  // White buttons
  var whiteBtn1 = document.getElementById('whiteSkill1Btn');
  var whiteBtn2 = document.getElementById('whiteSkill2Btn');
  var whiteBtn3 = document.getElementById('whiteSkill3Btn');

  if(whiteBtn1) {
    whiteBtn1.disabled = !window.whiteSkill1Available || window.whiteSkill1Used;
    whiteBtn1.classList.toggle('skill-available', window.whiteSkill1Available && !window.whiteSkill1Used);
    whiteBtn1.classList.toggle('skill-active', window.activeSkill && window.activeSkill.skill === 1 && window.activeSkill.color === 'w');

    // Update tooltip if upgraded
    if(window.whiteSkill1Upgraded) {
      whiteBtn1.title = 'Skill 1: Random Transform - Bishop/Knight/Rook (21 XP) [UPGRADED]';
    }
  }
  if(whiteBtn2) {
    var canUse = window.whiteSkill2Available && window.whiteSkill2Choice !== null && !window.whiteSkill2Used;
    whiteBtn2.disabled = !canUse;
    whiteBtn2.classList.toggle('skill-available', canUse);
    whiteBtn2.classList.toggle('skill-active', window.activeSkill && window.activeSkill.skill === 2 && window.activeSkill.color === 'w');

    // Update tooltip based on choice
    if(window.whiteSkill2Choice === 'freeze') {
      whiteBtn2.title = 'Skill 2: Freeze Timer - Pause your timer during your turn (41 XP)';
    } else if(window.whiteSkill2Choice === 'upgrade') {
      whiteBtn2.title = 'Skill 2: Already used to upgrade Skill 1';
    }
  }
  if(whiteBtn3) {
    whiteBtn3.disabled = !window.whiteSkill3Available || window.whiteSkill3Used;
    whiteBtn3.classList.toggle('skill-available', window.whiteSkill3Available && !window.whiteSkill3Used);
    whiteBtn3.classList.toggle('skill-active', window.activeSkill && window.activeSkill.skill === 3 && window.activeSkill.color === 'w');
  }

  // Black buttons
  var blackBtn1 = document.getElementById('blackSkill1Btn');
  var blackBtn2 = document.getElementById('blackSkill2Btn');
  var blackBtn3 = document.getElementById('blackSkill3Btn');

  if(blackBtn1) {
    blackBtn1.disabled = !window.blackSkill1Available || window.blackSkill1Used;
    blackBtn1.classList.toggle('skill-available', window.blackSkill1Available && !window.blackSkill1Used);
    blackBtn1.classList.toggle('skill-active', window.activeSkill && window.activeSkill.skill === 1 && window.activeSkill.color === 'b');

    if(window.blackSkill1Upgraded) {
      blackBtn1.title = 'Skill 1: Random Transform - Bishop/Knight/Rook (21 XP) [UPGRADED]';
    }
  }
  if(blackBtn2) {
    var canUse = window.blackSkill2Available && window.blackSkill2Choice !== null && !window.blackSkill2Used;
    blackBtn2.disabled = !canUse;
    blackBtn2.classList.toggle('skill-available', canUse);
    blackBtn2.classList.toggle('skill-active', window.activeSkill && window.activeSkill.skill === 2 && window.activeSkill.color === 'b');

    if(window.blackSkill2Choice === 'freeze') {
      blackBtn2.title = 'Skill 2: Freeze Timer - Pause your timer during your turn (41 XP)';
    } else if(window.blackSkill2Choice === 'upgrade') {
      blackBtn2.title = 'Skill 2: Already used to upgrade Skill 1';
    }
  }
  if(blackBtn3) {
    blackBtn3.disabled = !window.blackSkill3Available || window.blackSkill3Used;
    blackBtn3.classList.toggle('skill-available', window.blackSkill3Available && !window.blackSkill3Used);
    blackBtn3.classList.toggle('skill-active', window.activeSkill && window.activeSkill.skill === 3 && window.activeSkill.color === 'b');
  }
}

// Show Skill 2 unlock modal
function showSkill2UnlockModal(color) {
  window.skill2UnlockColor = color;
  showModal('skill2UnlockModal');

  var colorName = color === 'w' ? 'White' : 'Black';
  showToast('⚡ ' + colorName + ' unlocked Skill 2! Choose your power...', 5000);
}

// Skill 2 unlock choice: Freeze timer
function skill2UnlockChooseFreeze() {
  var color = window.skill2UnlockColor;

  if(color === 'w') {
    window.whiteSkill2Choice = 'freeze';
  } else {
    window.blackSkill2Choice = 'freeze';
  }

  hideModal('skill2UnlockModal');
  updateSkillButtons();

  var colorName = color === 'w' ? 'White' : 'Black';
  showToast('🧊 ' + colorName + ' chose: Freeze Timer! Use it to pause your timer during your turn.', 5000);
}

// Skill 2 unlock choice: Upgrade Skill 1
function skill2UnlockChooseUpgrade() {
  var color = window.skill2UnlockColor;

  if(color === 'w') {
    window.whiteSkill2Choice = 'upgrade';
    window.whiteSkill1Upgraded = true;
    window.whiteSkill2Used = true; // Mark as used since it's a permanent upgrade
  } else {
    window.blackSkill2Choice = 'upgrade';
    window.blackSkill1Upgraded = true;
    window.blackSkill2Used = true; // Mark as used since it's a permanent upgrade
  }

  hideModal('skill2UnlockModal');
  updateSkillButtons();

  var colorName = color === 'w' ? 'White' : 'Black';
  showToast('⬆️ ' + colorName + ' chose: Upgrade Skill 1! Now transforms to Bishop/Knight/Rook!', 5000);
}

// Activate skill - sets it as active and waits for piece selection
function activateSkill(skillNumber, color) {
  window.activeSkill = {skill: skillNumber, color: color};
  updateSkillButtons();

  if(skillNumber === 2) {
    // Skill 2: Freeze timer
    var choice = color === 'w' ? window.whiteSkill2Choice : window.blackSkill2Choice;
    if(choice === 'freeze') {
      executeSkill2Freeze(color);
      return;
    }
  }

  // For skills 1 and 3, highlight selectable pieces
  highlightSelectablePieces(color);

  var skillName = skillNumber === 1 ? 'Random Transform' : 'Queen Transform';
  showToast('🎯 ' + skillName + ' activated! Click on a piece to transform.', 3000);
}

// Cancel active skill
function cancelActiveSkill() {
  window.activeSkill = null;
  updateSkillButtons();
  clearPieceHighlights();
}

// Highlight pieces that can be selected for transformation
function highlightSelectablePieces(color) {
  clearPieceHighlights();

  var position = board.position();
  for(var square in position) {
    var piece = position[square];
    if(piece && piece.charAt(0) === color && piece.charAt(1) !== 'K') {
      var squareEl = $('#board').find('.square-' + square);
      squareEl.addClass('skill-selectable');
    }
  }
}

// Clear piece highlights
function clearPieceHighlights() {
  $('#board').find('.skill-selectable').removeClass('skill-selectable');
}

// Handle piece click when skill is active
function handleSkillPieceClick(square) {
  if(!window.activeSkill) return false;

  var piece = game.get(square);
  if(!piece || piece.color !== window.activeSkill.color) {
    showToast('❌ Invalid piece selection');
    return false;
  }

  if(piece.type === 'k') {
    showToast('❌ Cannot transform the King!');
    return false;
  }

  // Process the skill
  if(window.activeSkill.skill === 1) {
    executeSkill1(square, window.activeSkill.color);
  } else if(window.activeSkill.skill === 3) {
    executeSkill3(square, window.activeSkill.color);
  }

  return true;
}

// ============ SKILL 1: Random Transform (Bishop/Knight or +Rook if upgraded) ============
function useSkill1(color) {
  if(color === 'w' && window.whiteSkill1Used) {
    showToast('You already used this skill!');
    return;
  }
  if(color === 'b' && window.blackSkill1Used) {
    showToast('You already used this skill!');
    return;
  }

  activateSkill(1, color);
}

function executeSkill1(square, color) {
  var isUpgraded = color === 'w' ? window.whiteSkill1Upgraded : window.blackSkill1Upgraded;

  // Random selection: bishop, knight, or rook (if upgraded)
  var pieces = isUpgraded ? ['b', 'n', 'r'] : ['b', 'n'];
  var randomPiece = pieces[Math.floor(Math.random() * pieces.length)];

  var pieceNames = {b: 'Bishop', n: 'Knight', r: 'Rook'};
  var pieceSymbols = {b: '♗', n: '♘', r: '♜'};

  var pieceName = pieceNames[randomPiece];
  var pieceSymbol = pieceSymbols[randomPiece];

  // Show transformation modal
  showTransformModal(square, randomPiece, color, pieceName, pieceSymbol, function() {
    game.remove(square);
    game.put({type: randomPiece, color: color}, square);
    board.position(game.fen());

    // Send transformation to opponent in multiplayer mode
    if(window.gameMode === 'multiplayer' && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        skillTransform: true,
        square: square,
        newPiece: randomPiece,
        color: color,
        FEN: game.fen()
      }));
    }

    // Mark as used
    if(color === 'w') {
      window.whiteSkill1Used = true;
    } else {
      window.blackSkill1Used = true;
    }

    cancelActiveSkill();
    updateSkillButtons();
  });
}

// ============ SKILL 2: Freeze Timer ============
function useSkill2(color) {
  if(color === 'w' && window.whiteSkill2Used) {
    showToast('You already used this skill!');
    return;
  }
  if(color === 'b' && window.blackSkill2Used) {
    showToast('You already used this skill!');
    return;
  }

  // Check if choice was made
  var choice = color === 'w' ? window.whiteSkill2Choice : window.blackSkill2Choice;
  if(!choice) {
    showToast('You need to choose your Skill 2 power first!');
    return;
  }

  activateSkill(2, color);
}

function executeSkill2Freeze(color) {
  // Freeze own timer for the current turn
  var timerColor = color === 'w' ? 'white' : 'black';

  // Stop the timer temporarily
  if(color === 'w') {
    window.whiteTimerFrozen = true;
    window.whiteSkill2Used = true;
  } else {
    window.blackTimerFrozen = true;
    window.blackSkill2Used = true;
  }

  // Send freeze notification to opponent in multiplayer mode
  if(window.gameMode === 'multiplayer' && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      skillFreeze: true,
      color: color
    }));
  }

  cancelActiveSkill();
  updateSkillButtons();

  var colorName = color === 'w' ? 'White' : 'Black';
  showToast('🧊 ' + colorName + ' timer frozen for this turn! Think carefully...', 5000);
}

// ============ SKILL 3: Queen Transform ============
function useSkill3(color) {
  if(color === 'w' && window.whiteSkill3Used) {
    showToast('You already used this skill!');
    return;
  }
  if(color === 'b' && window.blackSkill3Used) {
    showToast('You already used this skill!');
    return;
  }

  activateSkill(3, color);
}

function executeSkill3(square, color) {
  showTransformModal(square, 'q', color, 'Queen', '♛', function() {
    game.remove(square);
    game.put({type: 'q', color: color}, square);
    board.position(game.fen());

    // Send transformation to opponent in multiplayer mode
    if(window.gameMode === 'multiplayer' && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        skillTransform: true,
        square: square,
        newPiece: 'q',
        color: color,
        FEN: game.fen()
      }));
    }

    // Mark as used
    if(color === 'w') {
      window.whiteSkill3Used = true;
    } else {
      window.blackSkill3Used = true;
    }

    cancelActiveSkill();
    updateSkillButtons();
  });
}

// Show transformation modal with animation
function showTransformModal(square, newPieceType, color, pieceName, pieceSymbol, onConfirm) {
  var modal = document.getElementById('transformModal');
  if(!modal) return;

  var oldPiece = game.get(square);
  var oldSymbol = getPieceSymbol(oldPiece.type);

  document.getElementById('transformOldPiece').textContent = oldSymbol;
  document.getElementById('transformNewPiece').textContent = pieceSymbol;
  document.getElementById('transformPieceName').textContent = pieceName;

  // Show modal
  showModal('transformModal');

  // Auto-confirm after animation
  setTimeout(function() {
    hideModal('transformModal');
    onConfirm();
    showToast('✨ Transformed to ' + pieceName + '!', 3000);
  }, 2500);
}

// Get piece symbol
function getPieceSymbol(pieceType) {
  var symbols = {
    'p': '♟',
    'n': '♞',
    'b': '♝',
    'r': '♜',
    'q': '♛',
    'k': '♚'
  };
  return symbols[pieceType] || pieceType;
}

// Called from game.js after each move
function handleSpecialMove(move) {
  addXP(move);
}

// Reset skills state when restarting game
function resetSkillsState() {
  window.whiteXP = 0;
  window.blackXP = 0;

  window.whiteSkill1Available = false;
  window.whiteSkill2Available = false;
  window.whiteSkill3Available = false;
  window.blackSkill1Available = false;
  window.blackSkill2Available = false;
  window.blackSkill3Available = false;

  window.whiteSkill1Used = false;
  window.whiteSkill2Used = false;
  window.whiteSkill3Used = false;
  window.blackSkill1Used = false;
  window.blackSkill2Used = false;
  window.blackSkill3Used = false;

  window.whiteSkill2Choice = null;
  window.blackSkill2Choice = null;
  window.whiteSkill1Upgraded = false;
  window.blackSkill1Upgraded = false;

  window.activeSkill = null;

  updateXPDisplay();
  updateSkillButtons();
  clearPieceHighlights();
}
