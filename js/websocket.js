// ============ WEBSOCKET CONNECTION ============

var ws = null;
var gameSessionId = null;

function initializeWebSocket() {
  // Get room from URL or generate new one
  var urlParams = new URLSearchParams(window.location.search);
  gameSessionId = urlParams.get('room') || 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Determine WebSocket URL based on environment
  var wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  var wsHost = window.location.hostname || 'localhost';
  var wsPort = window.location.port || '4000';
  var wsUrl = wsProtocol + '//' + wsHost + ':' + wsPort;

  ws = new WebSocket(wsUrl);

  ws.onopen = function() {
    console.log('WebSocket connected');
  };

  ws.onmessage = function(message) {
    handleServerMessage(JSON.parse(message.data));
  };

  ws.onerror = function(error) {
    console.error('WebSocket error:', error);
    showToast('Connection error. Please refresh the page.');
  };

  ws.onclose = function() {
    console.log('WebSocket disconnected');
    showToast('Disconnected from server');
  };
}

function sendMove(move) {
  move = JSON.parse(move);
  move.FEN = game.fen();
  ws.send(JSON.stringify(move));
}

function joinRoom(roomId) {
  if(ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ joinRoom: roomId }));
  }
}

function handleServerMessage(move) {
  console.log('Server message:', move);

  // Handle skill transformations
  if(move.skillTransform) {
    game.remove(move.square);
    game.put({type: move.newPiece, color: move.color}, move.square);
    board.position(game.fen());

    var pieceNames = {b: 'Bishop', n: 'Knight', r: 'Rook', q: 'Queen'};
    var pieceName = pieceNames[move.newPiece];
    var colorName = move.color === 'w' ? 'White' : 'Black';
    showToast('✨ ' + colorName + ' transformed a piece to ' + pieceName + '!', 3000);
    return;
  }

  // Handle skill freeze timer
  if(move.skillFreeze) {
    if(move.color === 'w') {
      window.whiteTimerFrozen = true;
    } else {
      window.blackTimerFrozen = true;
    }
    var colorName = move.color === 'w' ? 'White' : 'Black';
    showToast('🧊 ' + colorName + ' froze their timer for this turn!', 3000);
    return;
  }

  // Handle XP updates
  if(move.xpUpdate) {
    window.whiteXP = move.whiteXP;
    window.blackXP = move.blackXP;
    updateXPDisplay();
    return;
  }

  // Handle restart requests
  if(move.restartRequest) {
    $('#restartMessage').html(move.player + ' requests to restart the game. Do you accept?');
    $('#restartRequest').removeClass('hidden');
    window.restartRequested = true;
    return;
  }

  if(move.restartAccepted) {
    window.restartAccepted = true;
    performRestart();
    return;
  }

  if(move.restartRejected) {
    showToast(move.player + ' rejected the restart');
    window.restartRequested = false;
    window.restartAccepted = false;
    return;
  }

  // Handle player assignments
  if(!move.white || !move.black) {
    $('#turn').addClass('hidden');
  }

  if(move.white || move.black) {
    if(move.white) {
      $('#whiteButton').addClass('active');
    }
    if(move.black) {
      $('#blackButton').addClass('active');
    }

    if(move.white === window.playerName) {
      window.side = 'w';
    } else if(move.black === window.playerName) {
      window.side = 'b';
      if(board.orientation() === 'white') board.flip();
    }

    if(move.white && move.black) {
      updateTurnButton();
      $('#join').addClass('hidden');
      $('#whiteButton').addClass('active');
      $('#blackButton').addClass('active');
      $('#names').removeClass('hidden');
      $('#names').html(move.white + ' vs ' + move.black);
      $('#username').addClass('hidden');
    }
  }

  // Handle online count
  if(move.online) {
    $('#online').html(move.online + '/2 connected');
  }

  // Handle FEN updates
  if(move.currentFEN != null) {
    if(move.currentFEN !== game.fen()) {
      console.log('Updating inconsistent FEN');
      board.position(move.FEN);
      move = move.lastMove;
      if(move && move.from && move.to) {
        board.move(move.from + '-' + move.to);
        game.move({
          from: move.from,
          to: move.to,
          promotion: 'q'
        });
        highlight(move);
        updateMoveHistory(move);
        board.position(move.currentFEN);
        game.load(move.FEN);

        if(move.promotion && (move.promotion === 'n' || move.promotion === 'b')) {
          applyPromotion(move.to, move.promotion, game.fen().split(' ')[1] === 'w' ? 'b' : 'w');
        }

        if(move.specialChange) {
          applySpecialChange(move.specialChange);
        }
        return;
      }
    }
  }

  // Handle regular moves
  if(move.from && move.to) {
    board.move(move.from + '-' + move.to);
    game.move({
      from: move.from,
      to: move.to,
      promotion: 'q'
    });
    board.position(board.fen());
    highlight(move);
    updateMoveHistory(move);

    if(move.promotion && (move.promotion === 'n' || move.promotion === 'b')) {
      applyPromotion(move.to, move.promotion, game.fen().split(' ')[1] === 'w' ? 'b' : 'w');
    }

    if(move.specialChange) {
      applySpecialChange(move.specialChange);
    }
  }
}
