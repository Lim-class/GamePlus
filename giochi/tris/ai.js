// ai.js

// AI Logic with selective difficulties
function makeAIMove() {
    if (!gameActive) return;

    const difficulty = aiDifficulty.value;
    const emptyCells = board.map((val, index) => val === '' ? index : null).filter(val => val !== null);

    // 1. Easy Mode: Completely random moves
    if (difficulty === 'easy') {
        const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        applyAIMove(randomMove);
        return;
    }

    // 2. Medium Mode: 40% chance of making a random move instead of the smart one
    if (difficulty === 'medium' && Math.random() < 0.4) {
        const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        applyAIMove(randomMove);
        return;
    }

    // 3. Hard / Impossible Mode (and smart portion of Medium)
    // Check for a winning move
    let bestMove = getWinningMove(board, 'O');
    if (bestMove !== -1) {
        applyAIMove(bestMove);
        return;
    }

    // Check to block opponent's winning move
    bestMove = getWinningMove(board, 'X');
    if (bestMove !== -1) {
        applyAIMove(bestMove);
        return;
    }

    // Take the center
    if (board[4] === '') {
        applyAIMove(4);
        return;
    }

    // Take opposite corners
    const corners = [0, 2, 6, 8];
    for (let i = 0; i < corners.length; i++) {
        const corner = corners[i];
        const oppositeCorner = 8 - corner; 
        if (board[corner] === 'X' && board[oppositeCorner] === '') {
            applyAIMove(oppositeCorner);
            return;
        }
    }

    // Take any empty corner
    const emptyCorners = corners.filter(index => board[index] === '');
    if (emptyCorners.length > 0) {
        applyAIMove(emptyCorners[Math.floor(Math.random() * emptyCorners.length)]);
        return;
    }

    // Take any empty side
    const sides = [1, 3, 5, 7];
    const emptySides = sides.filter(index => board[index] === '');
    if (emptySides.length > 0) {
        applyAIMove(emptySides[Math.floor(Math.random() * emptySides.length)]);
        return;
    }
}

// Helper for AI: checks if a player can win and returns the winning move index
function getWinningMove(currentBoard, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (currentBoard[a] === player && currentBoard[b] === player && currentBoard[c] === '') return c;
        if (currentBoard[a] === player && currentBoard[c] === player && currentBoard[b] === '') return b;
        if (currentBoard[b] === player && currentBoard[c] === player && currentBoard[a] === '') return a;
    }
    return -1; 
}

// Applies the AI's chosen move
function applyAIMove(index) {
    board[index] = 'O'; 
    const cell = document.querySelector(`[data-index="${index}"]`);
    if (cell) {
        cell.textContent = 'O';
        cell.classList.add('occupied', 'O');
    }
    checkGameStatus();
}