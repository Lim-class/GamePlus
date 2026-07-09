// storage.js

// Saves current scores and game history to localStorage
function saveGameResults() {
    try {
        localStorage.setItem(LOCAL_STORAGE_SCORES_KEY, JSON.stringify(scores));
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(gameHistory));
    } catch (e) {
        console.error("Errore nel salvataggio dei dati in localStorage:", e);
        showMessageBox("Errore nel salvataggio dei dati locali.", 'error');
    }
}

// Loads scores and game history from localStorage
function loadGameResults() {
    try {
        const savedScores = localStorage.getItem(LOCAL_STORAGE_SCORES_KEY);
        const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);

        if (savedScores) {
            scores = JSON.parse(savedScores);
        }
        if (savedHistory) {
            gameHistory = JSON.parse(savedHistory);
        }
        updateScoreDisplay();
    } catch (e) {
        console.error("Errore nel caricamento dei dati da localStorage:", e);
        showMessageBox("Errore nel caricamento dei dati locali.", 'error');
    }
}

// Updates the score display in the UI
function updateScoreDisplay() {
    scoreXDisplay.textContent = scores.X;
    scoreODisplay.textContent = scores.O;
    scoreDrawsDisplay.textContent = scores.draws;
}

// Clears all saved data from localStorage
function clearAllData() {
    try {
        localStorage.removeItem(LOCAL_STORAGE_SCORES_KEY);
        localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
        scores = { X: 0, O: 0, draws: 0 }; 
        gameHistory = []; 
        updateScoreDisplay();
        showMessageBox("Tutti i dati sono stati eliminati con successo!", 'success');
        initGame(); 
    } catch (e) {
        console.error("Errore nell'eliminazione dei dati:", e);
        showMessageBox("Errore nell'eliminazione dei dati.", 'error');
    }
}