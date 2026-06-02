// ai.js

// AI Logic (Simple Minimax-like)
function makeAIMove() {
    if (!gameActive) return;

    // 1. Check for a winning move
    let bestMove = getWinningMove(board, 'O');
    if (bestMove !== -1) {
        applyAIMove(bestMove);
        return;
    }

    // 2. Check to block opponent's winning move
    bestMove = getWinningMove(board, 'X');
    if (bestMove !== -1) {
        applyAIMove(bestMove);
        return;
    }

    // 3. Take the center
    if (board[4] === '') {
        applyAIMove(4);
        return;
    }

    // 4. Take opposite corners
    const corners = [0, 2, 6, 8];
    for (let i = 0; i < corners.length; i++) {
        const corner = corners[i];
        const oppositeCorner = 8 - corner; 
        if (board[corner] === 'X' && board[oppositeCorner] === '') {
            applyAIMove(oppositeCorner);
            return;
        }
    }

    // 5. Take any empty corner
    const emptyCorners = corners.filter(index => board[index] === '');
    if (emptyCorners.length > 0) {
        applyAIMove(emptyCorners[Math.floor(Math.random() * emptyCorners.length)]);
        return;
    }

    // 6. Take any empty side
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
    document.querySelector(`[data-index="${index}"]`).textContent = 'O';
    document.querySelector(`[data-index="${index}"]`).classList.add('occupied', 'O');
    checkGameStatus();
}