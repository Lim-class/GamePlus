// globals.js

// Game elements
const gameBoard = document.getElementById('gameBoard');
const statusDisplay = document.getElementById('statusDisplay');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const scoreDrawsDisplay = document.getElementById('scoreDraws');

// Buttons
const pvpModeBtn = document.getElementById('pvpModeBtn');
const pvcModeBtn = document.getElementById('pvcModeBtn');
const resetGameBtn = document.getElementById('resetGameBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const clearDataBtn = document.getElementById('clearDataBtn');

// Modals
const gameResultModal = document.getElementById('gameResultModal');
const gameResultText = document.getElementById('gameResultText');
const closeResultModalBtn = document.getElementById('closeResultModalBtn');

const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const closeHistoryModalBtn = document.getElementById('closeHistoryModalBtn');

const confirmClearDataModal = document.getElementById('confirmClearDataModal');
const confirmClearDataBtn = document.getElementById('confirmClearDataBtn');
const cancelClearDataBtn = document.getElementById('cancelClearDataBtn');

// Game state
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;
let gameMode = 'player-vs-player'; // Default mode
let scores = { X: 0, O: 0, draws: 0 };
let gameHistory = []; 

// LocalStorage Keys
const LOCAL_STORAGE_SCORES_KEY = 'tris_scores';
const LOCAL_STORAGE_HISTORY_KEY = 'tris_history';

// Winning conditions (indices of board array)
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Shows a custom message box
function showMessageBox(message, type = 'info', onConfirm = null, onCancel = null) {
    const existingBox = document.querySelector('.custom-message-box');
    if (existingBox) existingBox.remove(); 

    const messageBox = document.createElement('div');
    messageBox.classList.add('custom-message-box', 'modal-overlay'); 
    
    let bgColor = '#4299e1'; 
    let btnColor = '#3182ce'; 

    if (type === 'success') {
        bgColor = '#48bb78'; 
        btnColor = '#38a169';
    } else if (type === 'warning') {
        bgColor = '#f0ad4e'; 
        btnColor = '#ec971f';
    } else if (type === 'error') {
        bgColor = '#f56565'; 
        btnColor = '#e53e3e';
    }

    messageBox.innerHTML = `
        <div class="modal-content" style="background-color: ${bgColor};">
            <p style="text-align: center; font-size: 1.2rem; margin-bottom: 1rem;">${message}</p>
            <div class="modal-buttons" style="justify-content: center;">
                <button class="confirm-btn" style="background-color: ${btnColor};">OK</button>
                ${onCancel ? `<button class="cancel-btn" style="background-color: #666;">Annulla</button>` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(messageBox);

    messageBox.querySelector('.confirm-btn').onclick = () => {
        messageBox.remove();
        if (onConfirm) onConfirm();
    };
    if (onCancel) {
        messageBox.querySelector('.cancel-btn').onclick = () => {
            messageBox.remove();
            if (onCancel) onCancel();
        };
    }
}