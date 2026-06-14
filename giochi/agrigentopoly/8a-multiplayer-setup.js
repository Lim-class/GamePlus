// 8a-multiplayer-setup.js

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

async function creaStanza() {
    let nameInput = document.getElementById('playerName').value.trim();
    let tokenSelect = document.getElementById('playerToken').value;

    if (nameInput === '') { 
        nameInput = prompt("Inserisci il tuo nome per creare la stanza:");
        if (!nameInput || nameInput.trim() === '') {
            alert("Devi inserire un nome per poter giocare!");
            return;
        }
    }

    roomId = generateRoomCode();
    myPlayerId = 0; 
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
        d1: 1, d2: 1,
        auctionData: null 
    };

    try {
        await window.db.collection("games").doc(roomId).set(gameData);
        
        const addPlayerForm = document.querySelector('.add-player-form');
        if(addPlayerForm) addPlayerForm.style.display = 'none';
        
        const btnStart = document.getElementById('btn-start');
        if(btnStart) btnStart.parentElement.style.display = 'none';
        
        document.getElementById('online-room-id-display').textContent = roomId;
        document.getElementById('online-lobby-status').style.display = 'block';
        
        alert(`Stanza creata con successo come: ${nameInput.trim()}!\\nCondividi il codice in verde coi tuoi amici.`);
        ascoltaCambiamentiPartita();
    } catch (error) {
        console.error("Errore Firebase:", error);
        alert("Errore durante la creazione della stanza online.");
    }
}

async function uniscitiStanza() {
    let nameInput = document.getElementById('playerName').value.trim();
    let tokenSelect = document.getElementById('playerToken').value;
    let codeInput = document.getElementById('roomCode').value.trim().toUpperCase();

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
        if (data.players.length >= 6) { alert("Stanza piena! Massimo 6 giocatori."); return; }
        if (data.players.some(p => p.token === tokenSelect)) { 
            alert("Questa pedina è già stata presa! Scegline un'altra dal menu."); 
            return; 
        }

        roomId = codeInput;
        myPlayerId = data.players.length;
        isOnline = true;

        const nuovoGiocatore = {
            id: myPlayerId, name: nameInput.trim(), token: tokenSelect, position: 0, money: 1500,
            inJail: false, jailTurns: 0, isSkipped: false, isBankrupt: false, consecutiveDoubles: 0
        };

        data.players.push(nuovoGiocatore);
        await gameRef.update({ players: data.players });

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

async function avviaPartitaOnline() {
    if (myPlayerId !== 0) return; 
    if (players.length < 2) { alert("Servono almeno 2 giocatori per iniziare!"); return; }

    try {
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('game-ui').style.display = '';
        
        await window.db.collection("games").doc(roomId).update({ status: "playing" });
    } catch (e) { console.error(e); }
}