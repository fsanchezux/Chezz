var connect = require('connect');
var http = require('http');
var url = require('url');
var fs = require('fs');
const PORT = process.env.PORT || 4000;
var myModule = require('./myModule');

var app = connect()
var WebSocketServer = require('ws').Server;
var server = http.createServer(app);

var wss = new WebSocketServer({ server: server});

String.prototype.contains = function(s) { return this.indexOf(s) != -1; }

// Rooms system - each room has its own game state
var rooms = {};

function getRoom(roomId) {
	if(!rooms[roomId]) {
		rooms[roomId] = {
			FEN: ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
			lastMsg: null,
			white: null,
			black: null,
			clients: []
		};
	}
	return rooms[roomId];
}

function broadcastToRoom(roomId, msg) {
	var room = rooms[roomId];
	if(room && room.clients) {
		room.clients.forEach(function(client) {
			if(client.readyState === 1) { // OPEN state
				client.send(msg);
			}
		});
	}
}

wss.on('connection', function(ws) {
	console.log('Client connected ' + new Date());
	ws.roomId = null; // Will be set when client joins a room

	ws.on('message', function(msg) {
		var o = JSON.parse(msg);

		// Handle room join
		if(o.joinRoom) {
			ws.roomId = o.joinRoom;
			var room = getRoom(ws.roomId);

			// Add client to room
			if(!room.clients.includes(ws)) {
				room.clients.push(ws);
			}

			console.log('Client joined room: ' + ws.roomId);

			// Send current room state to new client
			if(room.FEN.length > 1) {
				ws.send(JSON.stringify({
					lastMove: room.lastMsg,
					FEN: room.FEN[room.FEN.length-2],
					currentFEN: room.FEN[room.FEN.length-1],
					online: room.clients.length,
					white: room.white,
					black: room.black
				}));
			} else {
				ws.send(JSON.stringify({
					FEN: room.FEN[0],
					currentFEN: room.FEN[0],
					online: room.clients.length,
					white: room.white,
					black: room.black
				}));
			}
			return;
		}

		// All other messages require a room
		if(!ws.roomId) {
			console.log('Message received without room assignment');
			return;
		}

		var room = getRoom(ws.roomId);

		// Handle username/color assignment
		if(o.username) {
			console.log('User joining:', o);
			if(o.color == 'w' && !room.white) {
				if(room.black != o.username) {
					room.white = o.username;
					broadcastToRoom(ws.roomId, JSON.stringify({white: o.username, black: room.black}));
				}
			} else if(o.color == 'b' && !room.black) {
				if(room.white != o.username) {
					room.black = o.username;
					broadcastToRoom(ws.roomId, JSON.stringify({black: o.username, white: room.white}));
				}
			}
		} else {
			// Handle game moves
			if(o.FEN != null) {
				if(room.FEN[room.FEN.length-1] != o.FEN && room.FEN.indexOf(o.FEN) == -1) {
					room.FEN.push(o.FEN);
				}
				room.lastMsg = o;
				console.log("Room " + ws.roomId + " FEN stack:", room.FEN.length);
			}
			broadcastToRoom(ws.roomId, msg);
		}
	})

	ws.on('close', function() {
		if(ws.roomId) {
			var room = getRoom(ws.roomId);

			// Remove client from room
			var index = room.clients.indexOf(ws);
			if(index > -1) {
				room.clients.splice(index, 1);
			}

			console.log('Client disconnected from room: ' + ws.roomId);

			// Reset room if less than 2 clients
			if(room.clients.length < 2) {
				room.white = null;
				room.black = null;
				room.lastMsg = null;
				room.FEN = ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"];
				broadcastToRoom(ws.roomId, JSON.stringify({
					FEN: room.FEN[0],
					currentFEN: room.FEN[0],
					online: room.clients.length,
					white: room.white,
					black: room.black
				}));
			}

			// Clean up empty rooms
			if(room.clients.length === 0) {
				delete rooms[ws.roomId];
				console.log('Room deleted: ' + ws.roomId);
			}
		}
	})
});

function broadcast(msg) {
	wss.clients.forEach(function(client) {
		client.send(msg);
	});
}

// respond to all requests 
app.use(function(req, res){
	var urlObj = url.parse(req.url, true, false);
		if(urlObj.pathname.contains('index')) {
			myModule.readFile(fs, 'index.html', res);
		} else if(urlObj.pathname.contains('js') || urlObj.pathname.contains('css') || urlObj.pathname.contains('img')) {
			myModule.readFile(fs, urlObj.pathname.substring(1, urlObj.pathname.length), res);
		} else if(urlObj.pathname.contains('css')) {
			fs.readFile(urlObj.pathname.substring(1, urlObj.pathname.length), function(err, contents) {
				  if(!err) {
					  res.end(contents);
				  } else {
					  console.log(err);
				  }
			});
		}
 });
 

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));