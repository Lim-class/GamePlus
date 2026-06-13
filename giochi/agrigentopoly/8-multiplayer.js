// 8-multiplayer.js

// Genera un codice stanza casuale di 5 lettere/numeri
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

// Funzione attivata dall'Host per creare la sessione online
async function creaStanza() {
    let nameInput = document.getElementById('playerName').value.trim();
    let tokenSelect = document.getElementById('playerToken').value;

    // Sistema infallibile: se la casella è vuota, chiede il nome tramite popup
    if (nameInput === '') { 
        nameInput = prompt("Inserisci il tuo nome per creare la stanza:");
        if (!nameInput || nameInput.trim() === '') {
            alert("Devi inserire un nome per poter giocare!");
            return;
        }
    }

    roomId = generateRoomCode();
    myPlayerId = 0; // Il creatore è sempre il Giocatore 0
    isOnline = true;

    const primoGiocatore = {
        id: 0, name: nameInput.trim(), token: tokenSelect, position: 0, money: 1500,
        inJail: false, jailTurns: 0, isSkipped: false, isBankrupt: false, consecutiveDoubles: 0
    };

    players = [primoGiocatore];

    const gameData = {
        status: "waiting", 
        currentPlayerIndex: 0,
        diceRolled: false,
        players: players,
        boardSpaces: boardSpaces, 
        diceResultText: "",
        d1: 1, d2: 1
    };

    try {
        await window.db.collection("games").doc(roomId).set(gameData);
        
        // Nascondiamo i vecchi comandi per non fare confusione
        const addPlayerForm = document.querySelector('.add-player-form');
        if(addPlayerForm) addPlayerForm.style.display = 'none';
        
        const btnStart = document.getElementById('btn-start');
        if(btnStart) btnStart.parentElement.style.display = 'none';
        
        // Mostriamo i dettagli della lobby online
        document.getElementById('online-room-id-display').textContent = roomId;
        document.getElementById('online-lobby-status').style.display = 'block';
        
        alert(`Stanza creata con successo come: ${nameInput.trim()}!\nCondividi il codice in verde coi tuoi amici.`);
        ascoltaCambiamentiPartita();
    } catch (error) {
        console.error("Errore Firebase:", error);
        alert("Errore durante la creazione della stanza online.");
    }
}

// Funzione attivata dai partecipanti per entrare nella stanza col codice
async function uniscitiStanza() {
    let nameInput = document.getElementById('playerName').value.trim();
    let tokenSelect = document.getElementById('playerToken').value;
    let codeInput = document.getElementById('roomCode').value.trim().toUpperCase();

    // Controlli infallibili con popup se i campi sono vuoti
    if (codeInput === '') { 
        let codePrompt = prompt("Inserisci il CODICE della stanza a cui vuoi unirti:");
        if (!codePrompt || codePrompt.trim() === '') return;
        codeInput = codePrompt.trim().toUpperCase();
    }

    if (nameInput === '') { 
        nameInput = prompt("Come ti chiami? Inserisci il tuo nome:");
        if (!nameInput || nameInput.trim() === '') return;
    }

    try {
        const gameRef = window.db.collection("games").doc(codeInput);
        const doc = await gameRef.get();

        if (!doc.exists) {
            alert("Stanza inesistente! Controlla il codice.");
            return;
        }

        let data = doc.data();
        if (data.status === "playing") { alert("Partita già avviata! Non puoi più entrare."); return; }
        if (data.players.length >= 4) { alert("Stanza piena! Massimo 4 giocatori."); return; }
        if (data.players.some(p => p.token === tokenSelect)) { 
            alert("Questa pedina è già stata presa! Scegline un'altra dal menu."); 
            return; 
        }

        roomId = codeInput;
        myPlayerId = data.players.length; // Assegna l'ID progressivo
        isOnline = true;

        const nuovoGiocatore = {
            id: myPlayerId, name: nameInput.trim(), token: tokenSelect, position: 0, money: 1500,
            inJail: false, jailTurns: 0, isSkipped: false, isBankrupt: false, consecutiveDoubles: 0
        };

        data.players.push(nuovoGiocatore);
        await gameRef.update({ players: data.players });

        // Pulizia interfaccia
        const addPlayerForm = document.querySelector('.add-player-form');
        if(addPlayerForm) addPlayerForm.style.display = 'none';
        
        const btnStart = document.getElementById('btn-start');
        if(btnStart) btnStart.parentElement.style.display = 'none';
        
        const dashedDiv = document.querySelector('div[style*="dashed"]');
        if (dashedDiv) dashedDiv.style.display = 'none';

        document.getElementById('online-room-id-display').textContent = roomId;
        document.getElementById('online-lobby-status').style.display = 'block';
        
        ascoltaCambiamentiPartita();
    } catch (error) {
        console.error("Errore:", error);
    }
}

// Funzione attivata dall'Host per avviare il match e mostrare a tutti il tabellone
async function avviaPartitaOnline() {
    if (myPlayerId !== 0) return; // Solo l'host può cliccare
    if (players.length < 2) { alert("Servono almeno 2 giocatori per iniziare!"); return; }

    try {
        await window.db.collection("games").doc(roomId).update({ status: "playing" });
    } catch (e) { console.error(e); }
}

// Sincronizzazione in tempo reale
function ascoltaCambiamentiPartita() {
    window.db.collection("games").doc(roomId).onSnapshot((doc) => {
        if (!doc.exists || bloccoSnapshot) return;

        const data = doc.data();
        
        players = data.players;
        currentPlayerIndex = data.currentPlayerIndex;
        diceRolled = data.diceRolled;
        
        Object.keys(data.boardSpaces).forEach(pos => {
            if (boardSpaces[pos]) {
                // Se il dato non esiste (undefined), assegniamo un valore di default corretto per Firebase
                boardSpaces[pos].owner = data.boardSpaces[pos].owner !== undefined ? data.boardSpaces[pos].owner : null;
                boardSpaces[pos].houses = data.boardSpaces[pos].houses !== undefined ? data.boardSpaces[pos].houses : 0;
                boardSpaces[pos].mortgaged = data.boardSpaces[pos].mortgaged !== undefined ? data.boardSpaces[pos].mortgaged : false;
            }
        });

        if (data.d1) {
            document.getElementById('dice1').textContent = data.d1;
            document.getElementById('dice2').textContent = data.d2;
            document.getElementById('dice-result').textContent = data.diceResultText;
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
    });
}

// Invia i dati locali a Firebase dopo ogni azione
async function syncGameState() {
    if (!isOnline || !roomId) return;
    bloccoSnapshot = true; 
    
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
            diceResultText: resText
        });
    } catch (e) {
        console.error(e);
    } finally {
        setTimeout(() => { bloccoSnapshot = false; }, 250);
    }
}