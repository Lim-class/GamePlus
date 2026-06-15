// 8b-multiplayer-sync.js

// Invia i dati locali a Firebase dopo ogni azione
async function syncGameState() {
    if (!isOnline || !roomId) return;
    
    const d1Text = document.getElementById('dice1').textContent;
    const d2Text = document.getElementById('dice2').textContent;
    const resText = document.getElementById('dice-result').textContent;

    try {
        await window.db.collection("games").doc(roomId).update({
            players: players,
            currentPlayerIndex: currentPlayerIndex,
            diceRolled: diceRolled,
            boardSpaces: boardSpaces,
            d1: parseInt(d1Text) || 1,
            d2: parseInt(d2Text) || 1,
            diceResultText: resText,
            auctionData: auctionData 
        });
    } catch (e) {
        console.error(e);
    }
}