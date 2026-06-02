// game.js

// Initializes or resets the game board and state
function initGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    statusDisplay.textContent = `È il turno di ${currentPlayer}`;
    renderBoard();
    loadGameResults(); 
    if (gameMode === 'player-vs-ai' && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500); 
    }
}

// Renders the current state of the board to the HTML
function renderBoard() {
    gameBoard.innerHTML = '';
    board.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.textContent = cell;
        cellElement.dataset.index = index;
        if (cell !== '') {
            cellElement.classList.add('occupied', cell); 
        }
        cellElement.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cellElement);
    });
}

// Handles a click on a cell
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.index);

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add('occupied', currentPlayer);

    checkGameStatus();
}

// Checks if there's a winner or a draw
function checkGameStatus() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        endGame(currentPlayer);
        return;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        endGame('draw');
        return;
    }

    switchPlayer();
}

// Switches the current player
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `È il turno di ${currentPlayer}`;

    if (gameMode === 'player-vs-ai' && currentPlayer === 'O' && gameActive) {
        setTimeout(makeAIMove, 700); 
    }
}

// Ends the game, updates scores and history
function endGame(winner) {
    gameActive = false;
    let resultMessage = '';

    if (winner === 'draw') {
        resultMessage = 'Partita Pareggiata!';
        scores.draws++;
        gameHistory.push({ winner: 'Pareggio', board: [...board], timestamp: Date.now() });
    } else {
        resultMessage = `Il Giocatore ${winner} ha vinto!`;
        scores[winner]++;
        gameHistory.push({ winner: `Giocatore ${winner}`, board: [...board], timestamp: Date.now() });
    }

    updateScoreDisplay();
    saveGameResults();
    gameResultText.textContent = resultMessage;
    gameResultModal.classList.remove('hidden');
}

// --- Event Listeners ---

pvpModeBtn.addEventListener('click', () => {
    gameMode = 'player-vs-player';
    statusDisplay.textContent = `Modalità: Giocatore vs Giocatore`;
    initGame();
});

pvcModeBtn.addEventListener('click', () => {
    gameMode = 'player-vs-ai';
    statusDisplay.textContent = `Modalità: Giocatore vs PC`;
    initGame();
});

resetGameBtn.addEventListener('click', () => {
    initGame();
});

viewHistoryBtn.addEventListener('click', () => {
    historyModal.classList.remove('hidden');
    historyList.innerHTML = ''; 

    if (gameHistory.length === 0) {
        historyList.innerHTML = '<li style="text-align: center; color: #a0aec0;">Nessuna partita giocata ancora.</li>';
        return;
    }

    gameHistory.forEach((game, index) => {
        const listItem = document.createElement('li');
        const date = new Date(game.timestamp).toLocaleString();
        let boardPreview = game.board.map(cell => cell === '' ? '_' : cell).join(' '); 

        listItem.innerHTML = `
            <span>Partita ${index + 1}: ${game.winner}</span>
            <span style="font-size: 0.8em; color: #a0aec0;">(${date})</span>
            <span style="font-family: monospace; font-size: 0.9em; margin-top: 0.5em; display: block;">${boardPreview}</span>
        `;
        historyList.appendChild(listItem);
    });
});

closeResultModalBtn.addEventListener('click', () => {
    gameResultModal.classList.add('hidden');
});

closeHistoryModalBtn.addEventListener('click', () => {
    historyModal.classList.add('hidden');
});

clearDataBtn.addEventListener('click', () => {
    confirmClearDataModal.classList.remove('hidden');
});

confirmClearDataBtn.addEventListener('click', () => {
    confirmClearDataModal.classList.add('hidden');
    clearAllData();
});

cancelClearDataBtn.addEventListener('click', () => {
    confirmClearDataModal.classList.add('hidden');
});

// Initial game setup on load
window.onload = () => {
    initGame();
};