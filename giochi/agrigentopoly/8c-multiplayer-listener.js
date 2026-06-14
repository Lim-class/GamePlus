// 8c-multiplayer-listener.js

// Sincronizzazione in tempo reale dal server
function ascoltaCambiamentiPartita() {
    window.db.collection("games").doc(roomId).onSnapshot((doc) => {
        if (!doc.exists) return;

        const data = doc.data();
        
        players = data.players || players;
        currentPlayerIndex = data.currentPlayerIndex !== undefined ? data.currentPlayerIndex : currentPlayerIndex;
        diceRolled = data.diceRolled !== undefined ? data.diceRolled : diceRolled;
        auctionData = data.auctionData || null; 
        
        if (data.boardSpaces) {
            Object.keys(data.boardSpaces).forEach(pos => {
                if (boardSpaces[pos]) {
                    boardSpaces[pos].owner = data.boardSpaces[pos].owner !== undefined ? data.boardSpaces[pos].owner : null;
                    boardSpaces[pos].houses = data.boardSpaces[pos].houses !== undefined ? data.boardSpaces[pos].houses : 0;
                    boardSpaces[pos].mortgaged = data.boardSpaces[pos].mortgaged !== undefined ? data.boardSpaces[pos].mortgaged : false;
                }
            });
        }

        if (data.d1) {
            document.getElementById('dice1').textContent = data.d1;
            document.getElementById('dice2').textContent = data.d2;
            
            if (auctionData && auctionData.status === "active") {
                document.getElementById('dice-result').textContent = `🔨 Asta in corso per ${boardSpaces[auctionData.propertyPos].name}...`;
                document.getElementById('dice-result').style.color = "#e74c3c";
            } else {
                document.getElementById('dice-result').textContent = data.diceResultText;
                document.getElementById('dice-result').style.color = "#f1c40f";
            }
        }

        if (data.status === "playing") {
            document.getElementById('setup-screen').style.display = 'none';
            document.getElementById('game-ui').style.display = '';
        } else {
            const list = document.getElementById('players-list-setup');
            list.innerHTML = '';
            players.forEach(p => {
                const li = document.createElement('li');
                li.textContent = `${p.token} ${p.name} ${p.id === 0 ? '(Host)' : ''}`;
                list.appendChild(li);
            });

            if (myPlayerId === 0 && players.length >= 2) {
                document.getElementById('btn-start-online').style.display = 'block';
            }
        }

        updatePlayersUI();
        updateBoardTokens();
        Object.keys(boardSpaces).forEach(pos => updateSpaceVisuals(pos));

        // Richiama la logica degli eventi asincroni (come l'asta) gestita nel file 8d
        if (typeof handleOnlineAuction === 'function') {
            handleOnlineAuction();
        }
    });
}