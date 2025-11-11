// ================================
// CỜ CARO PRO - GAME LOGIC
// ================================

// Game Configuration
let BOARD_SIZE = 15;
const WIN_CONDITION = 5;

// Game State
let board = [];
let currentPlayer = 'X';
let gameActive = true;
const gameMode = 'pvc'; // Always AI vs Player
const aiDifficulty = 'hard'; // Always hardest difficulty
let soundEnabled = true;
let timerEnabled = false;

// Move History for Undo/Redo
let moveHistory = [];
let currentMoveIndex = -1;

// Statistics
let stats = {
    xWins: 0,
    oWins: 0,
    draws: 0
};

// Timer
let timerInterval = null;
let timerSeconds = 0;

// DOM Elements
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const startGameBtn = document.getElementById('startGameBtn');
const boardSizeSelect = document.getElementById('boardSize');
const soundToggle = document.getElementById('soundToggle');
const timerToggle = document.getElementById('timerToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const historyToggle = document.getElementById('historyToggle');
const sidePanel = document.getElementById('sidePanel');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const hintBtn = document.getElementById('hintBtn');
const moveHistoryElement = document.getElementById('moveHistory');
const timerDisplay = document.getElementById('timerDisplay');
const timerElement = document.getElementById('timer');

// Stats elements
const xWinsElement = document.getElementById('xWins');
const oWinsElement = document.getElementById('oWins');
const drawsElement = document.getElementById('draws');

// Particles
const particlesCanvas = document.getElementById('particles');
const particlesCtx = particlesCanvas.getContext('2d');
let particles = [];

// ================================
// INITIALIZATION
// ================================

function initGame() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    currentPlayer = 'X';
    gameActive = true;
    moveHistory = [];
    currentMoveIndex = -1;
    boardElement.innerHTML = '';
    particles = [];
    updateStatus();
    createBoard();
    updateHistoryUI();
    updateUndoRedoButtons();
    stopTimer();
    if (timerEnabled) {
        startTimer();
    }
    saveGame();
}

function createBoard() {
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, ${getCellSize()}px)`;
    boardElement.style.gridTemplateRows = `repeat(${BOARD_SIZE}, ${getCellSize()}px)`;

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('button');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.width = `${getCellSize()}px`;
            cell.style.height = `${getCellSize()}px`;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

function getCellSize() {
    if (BOARD_SIZE <= 10) return 40;
    if (BOARD_SIZE <= 15) return 35;
    return 30;
}

// ================================
// GAME LOGIC
// ================================

function handleCellClick(event) {
    if (!gameActive) return;
    if (gameMode === 'pvc' && currentPlayer === 'O') return; // AI turn

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (board[row][col] !== null) return;

    makeMove(row, col);
}

function makeMove(row, col, skipHistory = false) {
    // Place the piece
    board[row][col] = currentPlayer;
    const index = row * BOARD_SIZE + col;
    const cell = boardElement.children[index];
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    cell.disabled = true;

    // Add to history
    if (!skipHistory) {
        // Remove future moves if we're not at the end
        moveHistory = moveHistory.slice(0, currentMoveIndex + 1);
        moveHistory.push({ row, col, player: currentPlayer });
        currentMoveIndex++;
        updateHistoryUI();
    }

    // Play sound
    playSound('move');

    // Animation
    cell.style.animation = 'placepiece 0.3s ease';

    // Check for win
    const winningCells = checkWin(row, col);
    if (winningCells) {
        gameActive = false;
        highlightWinningCells(winningCells);
        const winner = currentPlayer;
        const winnerName = (gameMode === 'pvc' && winner === 'O') ? 'AI' : winner;
        statusElement.innerHTML = `<span class="player-${currentPlayer.toLowerCase()}">${winnerName} thắng</span>`;
        updateStats(winner);
        playSound('win');
        stopTimer();
        createParticles();
        saveGame();
        return;
    }

    // Check for draw
    if (isBoardFull()) {
        gameActive = false;
        statusElement.textContent = 'Hòa';
        updateStats('draw');
        playSound('draw');
        stopTimer();
        saveGame();
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
    updateUndoRedoButtons();
    saveGame();

    // AI move
    if (gameActive && gameMode === 'pvc' && currentPlayer === 'O') {
        setTimeout(() => {
            const aiMove = getAIMove();
            if (aiMove) {
                makeMove(aiMove.row, aiMove.col);
            }
        }, 300);
    }
}

function checkWin(row, col) {
    const directions = [
        [[0, 1], [0, -1]],   // Horizontal
        [[1, 0], [-1, 0]],   // Vertical
        [[1, 1], [-1, -1]],  // Diagonal \
        [[1, -1], [-1, 1]]   // Diagonal /
    ];

    const player = board[row][col];

    for (const direction of directions) {
        const cells = [[row, col]];

        // Check both directions
        for (const [dx, dy] of direction) {
            let r = row + dx;
            let c = col + dy;

            while (
                r >= 0 && r < BOARD_SIZE &&
                c >= 0 && c < BOARD_SIZE &&
                board[r][c] === player
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

function highlightWinningCells(cells) {
    cells.forEach(([row, col]) => {
        const index = row * BOARD_SIZE + col;
        const cell = boardElement.children[index];
        cell.classList.add('winning');
    });
}

function isBoardFull() {
    return board.every(row => row.every(cell => cell !== null));
}

function updateStatus() {
    if (!gameActive) return;
    const playerClass = currentPlayer === 'X' ? 'player-x' : 'player-o';
    const playerName = (gameMode === 'pvc' && currentPlayer === 'O') ? 'AI' : currentPlayer;
    statusElement.innerHTML = `Lượt <span class="${playerClass}">${playerName}</span>`;
}

// ================================
// AI LOGIC (GRAND MASTER LEVEL - ULTRA INTELLIGENT)
// ================================

// Transposition Table với Zobrist Hashing
let transpositionTable = new Map();
let zobristTable = [];
let zobristBlackTurn = 0;

// Killer moves for move ordering
let killerMoves = [];

// Initialize Zobrist hashing
function initZobrist() {
    zobristTable = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        zobristTable[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            zobristTable[i][j] = {
                'X': Math.floor(Math.random() * 0xFFFFFFFFFFFF),
                'O': Math.floor(Math.random() * 0xFFFFFFFFFFFF)
            };
        }
    }
    zobristBlackTurn = Math.floor(Math.random() * 0xFFFFFFFFFFFF);
}

function getZobristHash(isMaximizing) {
    let hash = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j]) {
                hash ^= zobristTable[i][j][board[i][j]];
            }
        }
    }
    if (!isMaximizing) hash ^= zobristBlackTurn;
    return hash;
}

function getAIMove() {
    // Reset transposition table for new move
    transpositionTable.clear();
    killerMoves = Array(10).fill(null).map(() => []);

    // Initialize Zobrist if not done
    if (zobristTable.length === 0) {
        initZobrist();
    }

    // Check for immediate winning move
    const winMove = findImmediateWin('O');
    if (winMove) return winMove;

    // Check for immediate blocking move (including double threats)
    const blockMove = findCriticalDefense('X');
    if (blockMove) return blockMove;

    // Check if we can create a winning threat
    const winThreat = findWinningThreat('O');
    if (winThreat) return winThreat;

    // Opening book for first few moves
    if (moveHistory.length <= 4) {
        const openingMove = getOpeningMove();
        if (openingMove) return openingMove;
    }

    // Use iterative deepening with VCF search
    return getBestMoveIterative();
}

// Find immediate winning move or blocking move
function findImmediateWin(player) {
    const relevantCells = getRelevantCells();

    for (const { row, col } of relevantCells) {
        if (board[row][col] === null) {
            // Try this move
            board[row][col] = player;
            const winning = checkWin(row, col);
            board[row][col] = null;

            if (winning) {
                return { row, col };
            }
        }
    }

    return null;
}

// Find critical defense moves (including double threats)
function findCriticalDefense(opponent) {
    const relevantCells = getRelevantCells();
    let criticalMoves = [];

    // First, find all threats
    for (const { row, col } of relevantCells) {
        if (board[row][col] === null) {
            board[row][col] = opponent;

            // Check if this creates a winning position
            if (checkWin(row, col)) {
                board[row][col] = null;
                return { row, col }; // Must block immediately
            }

            // Check if this creates an open four (unstoppable threat)
            const threatLevel = evaluateThreats(row, col, opponent);
            if (threatLevel >= 100000) {
                criticalMoves.push({ row, col, threat: threatLevel });
            }

            board[row][col] = null;
        }
    }

    // Check for double threats (opponent has two ways to win)
    if (criticalMoves.length >= 2) {
        // Opponent can create double threat - we must prevent it
        // Find moves that block multiple threats
        for (const { row, col } of relevantCells) {
            if (board[row][col] === null) {
                board[row][col] = 'O';
                let blockedThreats = 0;

                for (const threat of criticalMoves) {
                    board[threat.row][threat.col] = opponent;
                    if (!checkWin(threat.row, threat.col)) {
                        blockedThreats++;
                    }
                    board[threat.row][threat.col] = null;
                }

                board[row][col] = null;

                if (blockedThreats >= 2) {
                    return { row, col }; // This move blocks multiple threats
                }
            }
        }

        // If no move blocks multiple threats, block the strongest one
        if (criticalMoves.length > 0) {
            criticalMoves.sort((a, b) => b.threat - a.threat);
            return criticalMoves[0];
        }
    } else if (criticalMoves.length === 1) {
        return criticalMoves[0];
    }

    return null;
}

// Find moves that create winning threats
function findWinningThreat(player) {
    const relevantCells = getRelevantCells();
    let bestThreat = null;
    let bestScore = 0;

    for (const { row, col } of relevantCells) {
        if (board[row][col] === null) {
            board[row][col] = player;

            // Check if this creates multiple threats (double attack)
            const threats = countThreats(player);

            // Check if this creates an open four
            const threatLevel = evaluateThreats(row, col, player);

            board[row][col] = null;

            // If we create 2+ open threes or 1+ open four, it's a winning threat
            if (threats.openThrees >= 2 || threats.openFours >= 1) {
                const score = threats.openFours * 100000 + threats.openThrees * 10000;
                if (score > bestScore) {
                    bestScore = score;
                    bestThreat = { row, col };
                }
            }
        }
    }

    return bestThreat;
}

// Count threats on the board
function countThreats(player) {
    let openThrees = 0;
    let openFours = 0;
    let semiOpenThrees = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === player) {
                const patterns = analyzePatterns(row, col, player);
                openThrees += patterns.openThrees;
                openFours += patterns.openFours;
                semiOpenThrees += patterns.semiOpenThrees;
            }
        }
    }

    return { openThrees: Math.floor(openThrees / 3), openFours: Math.floor(openFours / 4), semiOpenThrees: Math.floor(semiOpenThrees / 3) };
}

// Analyze patterns around a position
function analyzePatterns(row, col, player) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let openThrees = 0;
    let openFours = 0;
    let semiOpenThrees = 0;

    for (const [dx, dy] of directions) {
        let count = 1;
        let openEnds = 0;
        let spaces = 0;

        // Check positive direction
        let r = row + dx;
        let c = col + dy;
        let hasSpace = false;

        for (let i = 0; i < 5; i++) {
            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;

            if (board[r][c] === player) {
                count++;
            } else if (board[r][c] === null) {
                if (i === 0) openEnds++;
                if (!hasSpace && count < 4) {
                    spaces++;
                    hasSpace = true;
                } else {
                    break;
                }
            } else {
                break;
            }

            r += dx;
            c += dy;
        }

        // Check negative direction
        r = row - dx;
        c = col - dy;
        hasSpace = false;

        for (let i = 0; i < 5; i++) {
            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;

            if (board[r][c] === player) {
                count++;
            } else if (board[r][c] === null) {
                if (i === 0) openEnds++;
                if (!hasSpace && count < 4) {
                    spaces++;
                    hasSpace = true;
                } else {
                    break;
                }
            } else {
                break;
            }

            r -= dx;
            c -= dy;
        }

        // Classify pattern
        if (count === 4 && openEnds >= 1) openFours++;
        else if (count === 3 && openEnds === 2) openThrees++;
        else if (count === 3 && openEnds === 1) semiOpenThrees++;
    }

    return { openThrees, openFours, semiOpenThrees };
}

// Evaluate threats at a position
function evaluateThreats(row, col, player) {
    const patterns = analyzePatterns(row, col, player);
    return patterns.openFours * 100000 + patterns.openThrees * 50000 + patterns.semiOpenThrees * 5000;
}

// Opening book - extensive optimal first moves
function getOpeningMove() {
    const center = Math.floor(BOARD_SIZE / 2);

    // First move: always play center (strongest opening)
    if (moveHistory.length === 0) {
        return { row: center, col: center };
    }

    // AI's first move (moveHistory.length === 1)
    if (moveHistory.length === 1) {
        const firstMove = moveHistory[0];

        // If opponent played center, play adjacent diagonal
        if (firstMove.row === center && firstMove.col === center) {
            const diagonals = [
                { row: center - 1, col: center - 1 },
                { row: center - 1, col: center + 1 },
                { row: center + 1, col: center - 1 },
                { row: center + 1, col: center + 1 }
            ];
            return diagonals[Math.floor(Math.random() * diagonals.length)];
        }

        // If opponent played off-center, play center
        if (board[center][center] === null) {
            return { row: center, col: center };
        }
    }

    // Human's second move (moveHistory.length === 2)
    if (moveHistory.length === 2) {
        const aiMove = moveHistory[1];

        // Find aggressive position near AI's piece
        const directions = [
            { row: aiMove.row - 1, col: aiMove.col },
            { row: aiMove.row + 1, col: aiMove.col },
            { row: aiMove.row, col: aiMove.col - 1 },
            { row: aiMove.row, col: aiMove.col + 1 },
            { row: aiMove.row - 1, col: aiMove.col - 1 },
            { row: aiMove.row - 1, col: aiMove.col + 1 },
            { row: aiMove.row + 1, col: aiMove.col - 1 },
            { row: aiMove.row + 1, col: aiMove.col + 1 },
        ];

        // Prefer positions that create a line
        for (const pos of directions) {
            if (pos.row >= 0 && pos.row < BOARD_SIZE &&
                pos.col >= 0 && pos.col < BOARD_SIZE &&
                board[pos.row][pos.col] === null) {

                // Check if this creates a potential line
                board[pos.row][pos.col] = 'O';
                const score = quickEvaluate(pos.row, pos.col, 'O');
                board[pos.row][pos.col] = null;

                if (score > 500) {
                    return pos;
                }
            }
        }

        // Fallback to any valid position
        for (const pos of directions) {
            if (pos.row >= 0 && pos.row < BOARD_SIZE &&
                pos.col >= 0 && pos.col < BOARD_SIZE &&
                board[pos.row][pos.col] === null) {
                return pos;
            }
        }
    }

    // AI's second move (moveHistory.length === 3 or 4)
    if (moveHistory.length === 3 || moveHistory.length === 4) {
        // Look for strong attacking positions
        const strategicMoves = getStrategicMoves();

        // Prioritize moves that create multiple threats
        for (const move of strategicMoves.slice(0, 5)) {
            board[move.row][move.col] = 'O';
            const threats = countThreats('O');
            board[move.row][move.col] = null;

            if (threats.openThrees >= 1 || threats.semiOpenThrees >= 2) {
                return move;
            }
        }

        if (strategicMoves.length > 0) {
            return strategicMoves[0];
        }
    }

    return null;
}

// Get strategic moves (near existing pieces, center-weighted)
function getStrategicMoves() {
    const moves = [];
    const center = Math.floor(BOARD_SIZE / 2);

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === null) {
                // Check if near any piece
                let hasNeighbor = false;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = row + dr;
                        const nc = col + dc;
                        if (nr >= 0 && nr < BOARD_SIZE &&
                            nc >= 0 && nc < BOARD_SIZE &&
                            board[nr][nc] !== null) {
                            hasNeighbor = true;
                            break;
                        }
                    }
                    if (hasNeighbor) break;
                }

                if (hasNeighbor) {
                    const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
                    moves.push({ row, col, priority: -distFromCenter });
                }
            }
        }
    }

    moves.sort((a, b) => b.priority - a.priority);
    return moves;
}

// Iterative deepening - progressively deeper search
function getBestMoveIterative() {
    let bestMove = null;
    const maxDepth = 6;
    const timeLimit = 4000; // 4 seconds max
    const startTime = Date.now();

    // Get relevant cells
    const relevantCells = getRelevantCells();
    let orderedMoves = orderMoves(relevantCells);

    // Try VCF search first (threat space search)
    const vcfMove = searchVCF('O', 10);
    if (vcfMove) return vcfMove;

    // Iterative deepening from depth 1 to maxDepth
    for (let depth = 1; depth <= maxDepth; depth++) {
        let bestScore = -Infinity;
        let currentBestMove = null;

        // Use previous iteration's best move ordering
        if (bestMove) {
            orderedMoves = orderedMoves.filter(m => m.row !== bestMove.row || m.col !== bestMove.col);
            orderedMoves.unshift(bestMove);
        }

        for (const { row, col } of orderedMoves) {
            // Check time limit
            if (Date.now() - startTime > timeLimit) {
                return bestMove || orderedMoves[0];
            }

            if (board[row][col] === null) {
                board[row][col] = 'O';
                const score = minimax(depth - 1, -Infinity, Infinity, false, depth);
                board[row][col] = null;

                if (score > bestScore) {
                    bestScore = score;
                    currentBestMove = { row, col };
                }

                // If we found a winning move, return immediately
                if (bestScore >= 999000) {
                    return currentBestMove;
                }
            }
        }

        if (currentBestMove) {
            bestMove = currentBestMove;
        }
    }

    return bestMove || orderedMoves[0];
}

// VCF (Victory by Continuous Fours) Search
function searchVCF(player, maxDepth) {
    if (maxDepth <= 0) return null;

    const relevantCells = getRelevantCells();

    // Try all attacking moves
    for (const { row, col } of relevantCells) {
        if (board[row][col] === null) {
            board[row][col] = player;

            // Check if this creates a winning threat
            const threats = analyzePatterns(row, col, player);

            if (threats.openFours >= 1) {
                // We created an open four - check if opponent can defend
                const opponent = player === 'O' ? 'X' : 'O';
                board[row][col] = null;

                // Find opponent's defense moves
                const defenses = [];
                for (const { row: dr, col: dc } of relevantCells) {
                    if (board[dr][dc] === null) {
                        board[dr][dc] = opponent;
                        board[row][col] = player;

                        const stillThreat = analyzePatterns(row, col, player);
                        if (stillThreat.openFours === 0) {
                            defenses.push({ row: dr, col: dc });
                        }

                        board[row][col] = null;
                        board[dr][dc] = null;
                    }
                }

                // If there's only one defense, continue VCF search
                if (defenses.length === 1) {
                    board[row][col] = player;
                    board[defenses[0].row][defenses[0].col] = opponent;

                    const nextVCF = searchVCF(player, maxDepth - 1);

                    board[defenses[0].row][defenses[0].col] = null;
                    board[row][col] = null;

                    if (nextVCF || maxDepth > 8) {
                        return { row, col };
                    }
                } else if (defenses.length === 0) {
                    // No defense possible - winning move!
                    board[row][col] = null;
                    return { row, col };
                }

                board[row][col] = player;
            }

            board[row][col] = null;
        }
    }

    return null;
}

// Order moves for better alpha-beta pruning (with killer moves)
function orderMoves(moves, depth = 0) {
    const scored = moves.map(move => {
        let score = 0;

        // Check killer moves first (moves that caused cutoffs in other branches)
        if (killerMoves[depth]) {
            for (const killer of killerMoves[depth]) {
                if (killer && killer.row === move.row && killer.col === move.col) {
                    score += 50000; // High priority for killer moves
                    break;
                }
            }
        }

        // Simulate move and get quick evaluation
        board[move.row][move.col] = 'O';
        score += quickEvaluate(move.row, move.col, 'O');

        // Check threats created
        const threats = analyzePatterns(move.row, move.col, 'O');
        score += threats.openFours * 100000;
        score += threats.openThrees * 10000;
        score += threats.semiOpenThrees * 1000;

        board[move.row][move.col] = null;

        return { ...move, score };
    });

    // Sort by score descending (best moves first)
    scored.sort((a, b) => b.score - a.score);
    return scored;
}

// Quick evaluation for move ordering
function quickEvaluate(row, col, player) {
    let score = 0;
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
        let count = 1;
        let blocked = 0;

        // Check positive direction
        for (let i = 1; i < 5; i++) {
            const nr = row + dx * i;
            const nc = col + dy * i;
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) {
                blocked++;
                break;
            }
            if (board[nr][nc] === player) count++;
            else if (board[nr][nc] !== null) {
                blocked++;
                break;
            }
            else break;
        }

        // Check negative direction
        for (let i = 1; i < 5; i++) {
            const nr = row - dx * i;
            const nc = col - dy * i;
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) {
                blocked++;
                break;
            }
            if (board[nr][nc] === player) count++;
            else if (board[nr][nc] !== null) {
                blocked++;
                break;
            }
            else break;
        }

        // Score based on count and blocked ends
        if (count >= 4) score += 100000;
        else if (count === 3 && blocked === 0) score += 5000;
        else if (count === 3 && blocked === 1) score += 1000;
        else if (count === 2 && blocked === 0) score += 500;
        else if (count === 2 && blocked === 1) score += 100;
    }

    return score;
}

function minimax(depth, alpha, beta, isMaximizing, originalDepth) {
    // Check transposition table
    const hash = getZobristHash(isMaximizing);
    const cached = transpositionTable.get(hash);

    if (cached && cached.depth >= depth) {
        if (cached.flag === 'exact') return cached.score;
        if (cached.flag === 'lowerbound') alpha = Math.max(alpha, cached.score);
        else if (cached.flag === 'upperbound') beta = Math.min(beta, cached.score);

        if (alpha >= beta) return cached.score;
    }

    // Check terminal states
    const winner = checkWinner();
    if (winner === 'O') return 1000000 - (originalDepth - depth); // Prefer faster wins
    if (winner === 'X') return -1000000 + (originalDepth - depth); // Prefer slower losses
    if (isBoardFull() || depth === 0) return evaluateBoard();

    const relevantCells = getRelevantCells();
    const depthIndex = originalDepth - depth;

    // Order moves for better pruning
    const orderedMoves = orderMoves(relevantCells, depthIndex).slice(0, Math.max(20, 30 - depth * 2));

    if (isMaximizing) {
        let maxScore = -Infinity;
        let bestMove = null;

        for (const { row, col } of orderedMoves) {
            if (board[row][col] === null) {
                board[row][col] = 'O';
                const score = minimax(depth - 1, alpha, beta, false, originalDepth);
                board[row][col] = null;

                if (score > maxScore) {
                    maxScore = score;
                    bestMove = { row, col };
                }

                alpha = Math.max(alpha, score);

                if (beta <= alpha) {
                    // Beta cutoff - store killer move
                    if (!killerMoves[depthIndex]) killerMoves[depthIndex] = [];
                    killerMoves[depthIndex].unshift(bestMove);
                    if (killerMoves[depthIndex].length > 2) killerMoves[depthIndex].pop();
                    break;
                }
            }
        }

        // Store in transposition table
        const flag = maxScore <= alpha ? 'upperbound' : maxScore >= beta ? 'lowerbound' : 'exact';
        transpositionTable.set(hash, { score: maxScore, depth, flag });

        return maxScore;
    } else {
        let minScore = Infinity;
        let bestMove = null;

        for (const { row, col } of orderedMoves) {
            if (board[row][col] === null) {
                board[row][col] = 'X';
                const score = minimax(depth - 1, alpha, beta, true, originalDepth);
                board[row][col] = null;

                if (score < minScore) {
                    minScore = score;
                    bestMove = { row, col };
                }

                beta = Math.min(beta, score);

                if (beta <= alpha) {
                    // Alpha cutoff - store killer move
                    if (!killerMoves[depthIndex]) killerMoves[depthIndex] = [];
                    killerMoves[depthIndex].unshift(bestMove);
                    if (killerMoves[depthIndex].length > 2) killerMoves[depthIndex].pop();
                    break;
                }
            }
        }

        // Store in transposition table
        const flag = minScore >= beta ? 'lowerbound' : minScore <= alpha ? 'upperbound' : 'exact';
        transpositionTable.set(hash, { score: minScore, depth, flag });

        return minScore;
    }
}

function checkWinner() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== null) {
                const winningCells = checkWin(row, col);
                if (winningCells) {
                    return board[row][col];
                }
            }
        }
    }
    return null;
}

function evaluateBoard() {
    let score = 0;

    // Evaluate all possible lines
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== null) {
                score += evaluatePosition(row, col);
            }
        }
    }

    return score;
}

function evaluatePosition(row, col) {
    const player = board[row][col];
    const directions = [
        [0, 1],   // Horizontal
        [1, 0],   // Vertical
        [1, 1],   // Diagonal \
        [1, -1]   // Diagonal /
    ];

    let score = 0;

    for (const [dx, dy] of directions) {
        let count = 1;
        let openEnds = 0;
        let spaces = 0; // Count empty spaces within pattern

        // Check positive direction
        let r = row + dx;
        let c = col + dy;
        let consecutiveEmpty = 0;

        for (let i = 0; i < 5; i++) {
            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;

            if (board[r][c] === player) {
                count++;
                consecutiveEmpty = 0;
            } else if (board[r][c] === null) {
                consecutiveEmpty++;
                if (consecutiveEmpty === 1) {
                    openEnds++;
                    spaces++;
                }
                if (i === 0) openEnds++;
            } else {
                break; // Blocked by opponent
            }

            r += dx;
            c += dy;
        }

        // Check negative direction
        r = row - dx;
        c = col - dy;
        consecutiveEmpty = 0;

        for (let i = 0; i < 5; i++) {
            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;

            if (board[r][c] === player) {
                count++;
                consecutiveEmpty = 0;
            } else if (board[r][c] === null) {
                consecutiveEmpty++;
                if (consecutiveEmpty === 1) {
                    openEnds++;
                    spaces++;
                }
                if (i === 0) openEnds++;
            } else {
                break; // Blocked by opponent
            }

            r -= dx;
            c -= dy;
        }

        // Advanced scoring based on patterns
        let lineScore = 0;

        if (count >= 5) {
            lineScore = 1000000; // Win
        } else if (count === 4) {
            if (openEnds >= 1) lineScore = 100000; // Four with opening - very dangerous
            else lineScore = 500; // Four blocked both ends
        } else if (count === 3) {
            if (openEnds === 2) lineScore = 50000; // Open three - very strong
            else if (openEnds === 1) lineScore = 5000; // Semi-open three
            else lineScore = 100; // Blocked three
        } else if (count === 2) {
            if (openEnds === 2 && spaces === 1) lineScore = 2000; // Split two with space
            else if (openEnds === 2) lineScore = 1000; // Open two
            else if (openEnds === 1) lineScore = 200; // Semi-open two
            else lineScore = 50; // Blocked two
        } else if (count === 1) {
            if (openEnds === 2) lineScore = 100; // Single with openings
            else if (openEnds === 1) lineScore = 10;
        }

        score += player === 'O' ? lineScore : -lineScore;
    }

    // Bonus for center control
    const center = Math.floor(BOARD_SIZE / 2);
    const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
    const centerBonus = (BOARD_SIZE - distFromCenter) * 5;
    score += player === 'O' ? centerBonus : -centerBonus;

    return score;
}

function getRelevantCells() {
    const relevant = new Map(); // Use Map to store priority
    const distance = 2;

    // First, add cells near threats (higher priority)
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== null) {
                // Calculate threat level of this piece
                const threatLevel = calculateThreatLevel(row, col);

                // Add cells around this piece with priority based on threat
                for (let dr = -distance; dr <= distance; dr++) {
                    for (let dc = -distance; dc <= distance; dc++) {
                        if (dr === 0 && dc === 0) continue;

                        const nr = row + dr;
                        const nc = col + dc;

                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
                            const key = `${nr},${nc}`;
                            const currentPriority = relevant.get(key) || 0;
                            const distFactor = Math.max(0, distance - Math.abs(dr) - Math.abs(dc));
                            const newPriority = threatLevel * distFactor;

                            if (newPriority > currentPriority) {
                                relevant.set(key, newPriority);
                            }
                        }
                    }
                }
            }
        }
    }

    // If board is empty, start from center
    if (relevant.size === 0) {
        const center = Math.floor(BOARD_SIZE / 2);
        relevant.set(`${center},${center}`, 100);
    }

    // Convert to array and sort by priority
    const cells = Array.from(relevant.entries()).map(([pos, priority]) => {
        const [row, col] = pos.split(',').map(Number);
        return { row, col, priority };
    });

    cells.sort((a, b) => b.priority - a.priority);

    return cells;
}

// Calculate how threatening a position is
function calculateThreatLevel(row, col) {
    const player = board[row][col];
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    let maxThreat = 0;

    for (const [dx, dy] of directions) {
        let count = 1;
        let openEnds = 0;

        // Count consecutive pieces and open ends
        let r = row + dx;
        let c = col + dy;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            count++;
            r += dx;
            c += dy;
        }
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
            openEnds++;
        }

        r = row - dx;
        c = col - dy;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            count++;
            r -= dx;
            c -= dy;
        }
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
            openEnds++;
        }

        // Calculate threat level
        let threat = 0;
        if (count >= 4) threat = 1000;
        else if (count === 3 && openEnds === 2) threat = 500;
        else if (count === 3 && openEnds === 1) threat = 300;
        else if (count === 2 && openEnds === 2) threat = 100;
        else if (count === 2 && openEnds === 1) threat = 50;

        maxThreat = Math.max(maxThreat, threat);
    }

    return maxThreat;
}

// ================================
// UNDO/REDO
// ================================

function undo() {
    if (currentMoveIndex < 0) return;

    const move = moveHistory[currentMoveIndex];
    board[move.row][move.col] = null;
    const index = move.row * BOARD_SIZE + move.col;
    const cell = boardElement.children[index];
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'winning');
    cell.disabled = false;

    currentMoveIndex--;
    currentPlayer = move.player;
    gameActive = true;
    updateStatus();
    updateHistoryUI();
    updateUndoRedoButtons();

    // Clear all winning highlights
    for (let i = 0; i < boardElement.children.length; i++) {
        boardElement.children[i].classList.remove('winning');
    }
}

function redo() {
    if (currentMoveIndex >= moveHistory.length - 1) return;

    currentMoveIndex++;
    const move = moveHistory[currentMoveIndex];

    board[move.row][move.col] = move.player;
    const index = move.row * BOARD_SIZE + move.col;
    const cell = boardElement.children[index];
    cell.textContent = move.player;
    cell.classList.add(move.player.toLowerCase());
    cell.disabled = true;

    currentPlayer = move.player === 'X' ? 'O' : 'X';

    // Check if this was the winning move
    const winningCells = checkWin(move.row, move.col);
    if (winningCells) {
        gameActive = false;
        highlightWinningCells(winningCells);
        const winnerName = (gameMode === 'pvc' && move.player === 'O') ? 'AI' : move.player;
        statusElement.innerHTML = `<span class="player-${move.player.toLowerCase()}">${winnerName} thắng</span>`;
    } else if (isBoardFull()) {
        gameActive = false;
        statusElement.textContent = 'Hòa';
    } else {
        gameActive = true;
        updateStatus();
    }

    updateHistoryUI();
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    undoBtn.disabled = currentMoveIndex < 0;
    redoBtn.disabled = currentMoveIndex >= moveHistory.length - 1;
}

// ================================
// HINT SYSTEM
// ================================

function showHint() {
    if (!gameActive) return;

    // Remove previous hint
    for (let i = 0; i < boardElement.children.length; i++) {
        boardElement.children[i].classList.remove('hint');
    }

    let hintMove;
    if (currentPlayer === 'O' && gameMode === 'pvc') {
        // Don't give hint for AI
        return;
    }

    // Use simplified AI logic to find best move for player X
    // Check for immediate winning move
    hintMove = findImmediateWin('X');

    if (!hintMove) {
        // Check for immediate blocking move
        hintMove = findImmediateWin('O');
    }

    if (!hintMove) {
        // Find best strategic move
        const relevantCells = getRelevantCells();
        const orderedMoves = orderMoves(relevantCells).slice(0, 10);

        let bestScore = -Infinity;
        for (const { row, col } of orderedMoves) {
            if (board[row][col] === null) {
                board[row][col] = 'X';
                const score = quickEvaluate(row, col, 'X') + evaluateThreats(row, col, 'X');
                board[row][col] = null;

                if (score > bestScore) {
                    bestScore = score;
                    hintMove = { row, col };
                }
            }
        }
    }

    if (hintMove) {
        const index = hintMove.row * BOARD_SIZE + hintMove.col;
        const cell = boardElement.children[index];
        cell.classList.add('hint');

        // Remove hint after 2 seconds
        setTimeout(() => {
            cell.classList.remove('hint');
        }, 2000);

        playSound('hint');
    }
}

// ================================
// MOVE HISTORY UI
// ================================

function updateHistoryUI() {
    moveHistoryElement.innerHTML = '';

    moveHistory.forEach((move, index) => {
        const moveDiv = document.createElement('div');
        moveDiv.className = `history-item ${index === currentMoveIndex ? 'current' : ''} ${index > currentMoveIndex ? 'future' : ''}`;

        const moveNumber = index + 1;
        const row = String.fromCharCode(65 + move.row); // A, B, C...
        const col = move.col + 1;

        moveDiv.innerHTML = `
            <span class="move-number">${moveNumber}.</span>
            <span class="player-${move.player.toLowerCase()}">${move.player}</span>
            <span class="move-position">${row}${col}</span>
        `;

        moveDiv.addEventListener('click', () => jumpToMove(index));
        moveHistoryElement.appendChild(moveDiv);
    });

    // Auto scroll to bottom
    moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
}

function jumpToMove(index) {
    while (currentMoveIndex > index) {
        undo();
    }
    while (currentMoveIndex < index) {
        redo();
    }
}

// ================================
// TIMER
// ================================

function startTimer() {
    timerSeconds = 0;
    timerElement.style.display = 'block';
    timerInterval = setInterval(() => {
        timerSeconds++;
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ================================
// STATISTICS
// ================================

function updateStats(result) {
    if (result === 'X') {
        stats.xWins++;
        xWinsElement.textContent = stats.xWins;
    } else if (result === 'O') {
        stats.oWins++;
        oWinsElement.textContent = stats.oWins;
    } else if (result === 'draw') {
        stats.draws++;
        drawsElement.textContent = stats.draws;
    }
    saveStats();
}

function loadStats() {
    const saved = localStorage.getItem('caroStats');
    if (saved) {
        stats = JSON.parse(saved);
        xWinsElement.textContent = stats.xWins;
        oWinsElement.textContent = stats.oWins;
        drawsElement.textContent = stats.draws;
    }
}

function saveStats() {
    localStorage.setItem('caroStats', JSON.stringify(stats));
}

// ================================
// SOUND EFFECTS
// ================================

function playSound(type) {
    if (!soundEnabled) return;

    // Create simple beep sounds using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    switch(type) {
        case 'move':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'win':
            // Play ascending notes
            [523, 659, 784].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
                osc.start(audioContext.currentTime + i * 0.1);
                osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
            });
            break;
        case 'draw':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'hint':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
            break;
    }
}

// ================================
// PARTICLES ANIMATION
// ================================

function createParticles() {
    particlesCanvas.width = particlesCanvas.offsetWidth;
    particlesCanvas.height = particlesCanvas.offsetHeight;

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * particlesCanvas.width,
            y: Math.random() * particlesCanvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: Math.random() * 4 + 2,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            life: 100
        });
    }

    animateParticles();
}

function animateParticles() {
    if (particles.length === 0) return;

    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        particlesCtx.globalAlpha = p.life / 100;
        particlesCtx.fillStyle = p.color;
        particlesCtx.beginPath();
        particlesCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        particlesCtx.fill();

        return p.life > 0;
    });

    if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
    } else {
        particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    }
}

// ================================
// DARK MODE
// ================================

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    updateDarkModeIcon(isDark);
    localStorage.setItem('darkMode', isDark);
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
}

function updateDarkModeIcon(isDark) {
    darkModeToggle.innerHTML = isDark
        ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="4"/><path d="M10 0v2M10 18v2M20 10h-2M2 10H0M16.95 16.95l-1.41-1.41M4.46 4.46L3.05 3.05M16.95 3.05l-1.41 1.41M4.46 15.54L3.05 16.95"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>';
}

// ================================
// SAVE/LOAD GAME
// ================================

function saveGame() {
    const gameState = {
        board,
        currentPlayer,
        gameActive,
        moveHistory,
        currentMoveIndex,
        BOARD_SIZE
    };
    localStorage.setItem('caroGame', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('caroGame');
    if (saved) {
        try {
            const gameState = JSON.parse(saved);
            board = gameState.board;
            currentPlayer = gameState.currentPlayer;
            gameActive = gameState.gameActive;
            moveHistory = gameState.moveHistory || [];
            currentMoveIndex = gameState.currentMoveIndex || -1;
            BOARD_SIZE = gameState.BOARD_SIZE || 15;

            // Update board size select
            boardSizeSelect.value = BOARD_SIZE;

            // Recreate board UI
            boardElement.innerHTML = '';
            createBoard();

            // Restore board state
            for (let row = 0; row < BOARD_SIZE; row++) {
                for (let col = 0; col < BOARD_SIZE; col++) {
                    if (board[row][col] !== null) {
                        const index = row * BOARD_SIZE + col;
                        const cell = boardElement.children[index];
                        cell.textContent = board[row][col];
                        cell.classList.add(board[row][col].toLowerCase());
                        cell.disabled = true;
                    }
                }
            }

            updateStatus();
            updateHistoryUI();
            updateUndoRedoButtons();
        } catch (e) {
            console.error('Failed to load game:', e);
            initGame();
        }
    }
}

// ================================
// EVENT LISTENERS
// ================================

resetBtn.addEventListener('click', initGame);

startGameBtn.addEventListener('click', () => {
    BOARD_SIZE = parseInt(boardSizeSelect.value);
    soundEnabled = soundToggle.checked;
    timerEnabled = timerToggle.checked;
    initGame();
});

darkModeToggle.addEventListener('click', toggleDarkMode);

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
hintBtn.addEventListener('click', showHint);

settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('collapsed');
});

historyToggle.addEventListener('click', () => {
    sidePanel.classList.toggle('collapsed');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
            e.preventDefault();
            redo();
        }
    }
    if (e.key === 'h' || e.key === 'H') {
        showHint();
    }
});

// ================================
// INITIALIZE ON LOAD
// ================================

loadDarkMode();
loadStats();
loadGame();
