# Multiplayer Chess

A real-time multiplayer chess game built with Node.js, WebSockets, and chessboard.js. Play chess online with friends in separate rooms with support for single-player mode and an innovative "3 Rules" game mode.

![Chess Game Screenshot](https://raw.githubusercontent.com/qubard/comp2406a2/master/screenshot.png)

## Features

### Game Modes
- **Multiplayer Mode**: Play against other players in real-time using WebSocket connections
- **Single Player Mode**: Practice against yourself with local gameplay
- **3 Rules Mode**: Unique chess variant where following three principles of chess unlocks piece transformation in the late game

### Multiplayer Features
- **Room System**: Create or join specific game rooms using room codes
- **Real-time Synchronization**: Moves are instantly synchronized between players
- **Player Assignment**: Automatic white/black player assignment
- **Reconnection Support**: Room state persists for reconnecting players
- **Online Status**: See how many players are in your room

### UI Features
- **Dark/Light Theme**: Toggle between dark and light themes
- **Responsive Design**: Works on desktop and mobile devices
- **Move History**: Track all moves made during the game
- **Game Controls**: Reset board, flip board orientation, resign options
- **Move Validation**: Legal move checking with visual feedback
- **Captured Pieces Display**: See pieces captured by each side

## Technology Stack

- **Backend**: Node.js with Connect framework
- **WebSockets**: ws library for real-time communication
- **Frontend**: HTML5, CSS3, JavaScript (ES5+)
- **Chess Logic**: chess.js library
- **UI Framework**: Bootstrap 3
- **Board Rendering**: chessboard.js

## Installation

### Prerequisites
- Node.js (v10 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd multiplayer-chess
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node app.js
```

4. Open your browser and navigate to:
```
http://localhost:4000/index.html
```

## Usage

### Starting a Multiplayer Game

1. Enter your username
2. Enter a room code (any alphanumeric string)
3. Click "Join Room"
4. Share the room code with your opponent
5. One player selects White, the other selects Black
6. Start playing!

### Single Player Mode

1. Click the "Single Player" button
2. Play both sides of the board locally

### 3 Rules Mode

1. Enable "3 Rules Mode" before starting
2. Follow the three fundamental principles of chess:
   - Control the center
   - Develop your pieces
   - Protect your king
3. Successfully following these principles unlocks piece transformation abilities in the endgame

## Project Structure

```
multiplayer-chess/
├── app.js              # Main server file with WebSocket logic
├── myModule.js         # File serving module
├── package.json        # Project dependencies
├── index.html          # Main game interface
├── css/
│   └── custom-chess.css   # Custom styles and themes
├── js/
│   ├── chess.js        # Chess game logic
│   ├── chessboard-0.3.0.js  # Chessboard rendering
│   └── jquery-2.1.4.min.js  # jQuery library
└── img/               # Chess piece images
```

## How It Works

### Server Architecture
- Uses Connect for HTTP server functionality
- WebSocket server (ws) manages real-time game state
- Room-based system allows multiple concurrent games
- Each room maintains:
  - FEN notation history (game state)
  - White and black player assignments
  - Connected clients
  - Last move information

### Client-Server Communication
- Clients join rooms using unique room codes
- Game moves are broadcast to all clients in the same room
- Room state resets when fewer than 2 players remain
- Empty rooms are automatically cleaned up

### Game State Management
- Uses FEN (Forsyth-Edwards Notation) for board state
- Move validation performed client-side using chess.js
- Server maintains move history and broadcasts to all clients
- Prevents invalid moves and illegal positions

## Configuration

The server runs on port 4000 by default, or uses the PORT environment variable if set:

```javascript
const PORT = process.env.PORT || 4000;
```

To run on a different port:
```bash
PORT=3000 node app.js
```

## Development

### Key Files

- `app.js:19-30` - Room creation and management
- `app.js:43-117` - WebSocket message handling
- `app.js:119-153` - Client disconnect and cleanup logic
- `index.html` - Complete game UI and client-side logic

## Future Enhancements

- [ ] Add chess clock/timer functionality
- [ ] Implement player ratings/ELO system
- [ ] Add spectator mode
- [ ] Save and replay games (PGN export)
- [ ] Add chat functionality
- [ ] Implement matchmaking system
- [ ] Add AI opponent for single player
- [ ] Tournament mode support

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Credits

- Chess logic: [chess.js](https://github.com/jhlywa/chess.js)
- Chessboard UI: [chessboard.js](https://chessboardjs.com/)
- UI Framework: Bootstrap 3
- WebSocket library: [ws](https://github.com/websockets/ws)

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Enjoy playing chess!** ♟️
