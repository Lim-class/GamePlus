// 1-globals.js
let players = [];
let currentPlayerIndex = 0;
let diceRolled = false;

// Variabili per il Multiplayer Online
let roomId = null;
let myPlayerId = null;
let isOnline = false;

// Variabile per gestire l'Asta a turni online
let auctionData = null; 

// Funzione globale helper per salvare lo stato di gioco su Firebase
function saveGame() {
    if (isOnline && roomId && typeof syncGameState === 'function') {
        syncGameState();
    }
}