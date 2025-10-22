// Cờ Caro Game Logic

const BOARD_SIZE = 15;
const WIN_CONDITION = 5;

let board = [];
let currentPlayer = 'X';
let gameActive = true;

// DOM Elements
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

// Initialize game
function initGame() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    currentPlayer = 'X';
    gameActive = true;
    boardElement.innerHTML = '';
    updateStatus();
    createBoard();
}

// Create board UI
function createBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('button');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

// Handle cell click
function handleCellClick(event) {
    if (!gameActive) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (board[row][col] !== null) return;

    // Place the piece
    board[row][col] = currentPlayer;
    event.target.textContent = currentPlayer;
    event.target.classList.add(currentPlayer.toLowerCase());
    event.target.disabled = true;

    // Check for win
    const winningCells = checkWin(row, col);
    if (winningCells) {
        gameActive = false;
        highlightWinningCells(winningCells);
        statusElement.innerHTML = `<span class="player-${currentPlayer.toLowerCase()}">Người chơi ${currentPlayer} thắng!</span>`;
        return;
    }

    // Check for draw
    if (isBoardFull()) {
        gameActive = false;
        statusElement.textContent = 'Hòa!';
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
}

// Check for win condition
function checkWin(row, col) {
    const directions = [
        [[0, 1], [0, -1]],   // Horizontal
        [[1, 0], [-1, 0]],   // Vertical
        [[1, 1], [-1, -1]],  // Diagonal \
        [[1, -1], [-1, 1]]   // Diagonal /
    ];

    for (const direction of directions) {
        const cells = [[row, col]];

        // Check both directions
        for (const [dx, dy] of direction) {
            let r = row + dx;
            let c = col + dy;

            while (
                r >= 0 && r < BOARD_SIZE &&
                c >= 0 && c < BOARD_SIZE &&
                board[r][c] === currentPlayer
            ) {
                cells.push([r, c]);
                r += dx;
                c += dy;
            }
        }

        if (cells.length >= WIN_CONDITION) {
            return cells;
        }
    }

    return null;
}

// Highlight winning cells
function highlightWinningCells(cells) {
    cells.forEach(([row, col]) => {
        const index = row * BOARD_SIZE + col;
        const cell = boardElement.children[index];
        cell.classList.add('winning');
    });
}

// Check if board is full
function isBoardFull() {
    return board.every(row => row.every(cell => cell !== null));
}

// Update status display
function updateStatus() {
    const playerClass = currentPlayer === 'X' ? 'player-x' : 'player-o';
    statusElement.innerHTML = `Lượt của: <span class="${playerClass}">${currentPlayer}</span>`;
}

// Reset game
resetBtn.addEventListener('click', initGame);

// Start the game
initGame();
