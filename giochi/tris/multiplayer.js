// multiplayer.js

// Gestione click accoppiamento casuale online
randomMatchBtn.addEventListener('click', async () => {
    gameMode = 'online';
    difficultyControl.style.display = 'none';
    statusDisplay.textContent = "Ricerca di un avversario in corso...";
    
    if (unsubscribeOnline) unsubscribeOnline();

    try {
        const gamesRef = window.db.collection('games');
        // Cerca sessioni pubbliche in stato "waiting"
        const snapshot = await gamesRef
            .where('status', '==', 'waiting')
            .where('isPrivate', '==', false)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            // Stanza trovata: ci uniamo come Giocatore O
            const doc = snapshot.docs[0];
            onlineGameId = doc.id;
            myRole = 'O';
            
            await gamesRef.doc(onlineGameId).update({
                status: 'playing'
            });
            
            startOnlineGame();
        } else {
            // Nessuna stanza libera: ne creiamo una nuova come Giocatore X
            myRole = 'X';
            const newGameDoc = await gamesRef.add({
                board: ['', '', '', '', '', '', '', '', ''],
                currentPlayer: 'X',
                status: 'waiting',
                isPrivate: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            onlineGameId = newGameDoc.id;
            startOnlineGame();
        }
    } catch (error) {
        console.error("Errore nel matchmaking online:", error);
        showMessageBox("Impossibile connettersi ai server multiplayer.", "error");
    }
});

// Gestione click stanze private
privateRoomBtn.addEventListener('click', () => {
    const scelta = prompt("Digita 'CREA' per generare una stanza o 'ENTRA' per unirti ad una esistente:").toLowerCase();
    
    if (scelta === 'crea') {
        const codiceStanza = Math.random().toString(36).substring(2, 6).toUpperCase();
        setupPrivateRoom(codiceStanza);
    } else if (scelta === 'entra') {
        const codiceInserito = prompt("Inserisci il codice di 4 lettere della stanza:");
        if (codiceInserito) {
            joinPrivateRoom(codiceInserito.toUpperCase());
        }
    } else {
        alert("Opzione non valida.");
    }
});

async function setupPrivateRoom(roomCode) {
    gameMode = 'online';
    difficultyControl.style.display = 'none';
    myRole = 'X';
    onlineGameId = roomCode;
    statusDisplay.textContent = `Codice Stanza: ${roomCode}. In attesa del tuo amico...`;

    if (unsubscribeOnline) unsubscribeOnline();

    await window.db.collection('games').doc(roomCode).set({
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        status: 'waiting',
        isPrivate: true
    });

    startOnlineGame();
}

async function joinPrivateRoom(roomCode) {
    if (unsubscribeOnline) unsubscribeOnline();

    try {
        const docRef = window.db.collection('games').doc(roomCode);
        const docSnap = await docRef.get();

        if (docSnap.exists && docSnap.data().status === 'waiting') {
            gameMode = 'online';
            difficultyControl.style.display = 'none';
            myRole = 'O';
            onlineGameId = roomCode;

            await docRef.update({ status: 'playing' });
            startOnlineGame();
        } else {
            alert("Codice errato o la partita è già iniziata/scaduta.");
        }
    } catch (error) {
        console.error("Errore accesso stanza privata:", error);
    }
}

// Avvia l'ascoltatore sincronizzato in tempo reale con Firestore
function startOnlineGame() {
    gameActive = true;

    unsubscribeOnline = window.db.collection('games').doc(onlineGameId)
        .onSnapshot((doc) => {
            const data = doc.data();
            if (!data) return;

            // Allinea la scacchiera locale con i dati del database cloud
            board = data.board;
            currentPlayer = data.currentPlayer;

            renderBoard();

            if (data.status === 'waiting') {
                if (data.isPrivate) {
                    statusDisplay.textContent = `Codice: ${onlineGameId}. In attesa dell'amico...`;
                } else {
                    statusDisplay.textContent = "In attesa di un avversario...";
                }
            } else if (data.status === 'playing') {
                statusDisplay.textContent = (currentPlayer === myRole) ? `Tocca a te! (Sei ${myRole})` : `Turno dell'avversario (${currentPlayer})...`;
                
                // Controlla localmente se l'ultima mossa ricevuta ha concluso il gioco
                checkOnlineGameStatus();
            } else if (data.status === 'ended') {
                gameActive = false;
            }
        });
}

// Verifica locale degli endpoint di vittoria dedicati al multiplayer
function checkOnlineGameStatus() {
    let roundWon = false;
    let winnerToken = null;

    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        let a = board[condition[0]];
        let b = board[condition[1]];
        let c = board[condition[2]];

        if (a === '' || b === '' || c === '') continue;
        if (a === b && b === c) {
            roundWon = true;
            winnerToken = a;
            break;
        }
    }

    if (roundWon) {
        endGame(winnerToken);
    } else if (!board.includes('')) {
        endGame('draw');
    }
}