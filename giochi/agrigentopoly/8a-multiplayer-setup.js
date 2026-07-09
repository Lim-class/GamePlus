// 8a-multiplayer-setup.js

function showSetupMessage(msg, type) {
    const msgDiv = document.getElementById('setup-message');
    msgDiv.textContent = msg;
    msgDiv.className = `setup-message ${type}`;
    msgDiv.style.display = 'block';
    
    if (type === 'error') {
        setTimeout(() => { msgDiv.style.display = 'none'; }, 4000);
    }
}

function resetBtn(btnId, originalText) {
    const btn = document.getElementById(btnId);
    if(btn) {
        btn.classList.remove('loading');
        btn.disabled = false;
        if(originalText) btn.textContent = originalText;
    }
}

function copiaCodice() {
    const code = document.getElementById('online-room-id-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('btn-copy-code');
        btn.innerHTML = '✅ Copiato!';
        btn.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            btn.innerHTML = '📋 Copia';
            btn.style.backgroundColor = ''; 
        }, 2000);
    }).catch(err => {
        console.error('Errore nella copia: ', err);
        showSetupMessage("❌ Impossibile copiare il codice.", "error");
    });
}

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

async function creaStanza() {
    let nameInput = document.getElementById('playerName').value.trim();
    let tokenSelect = document.getElementById('playerToken').value;

    if (nameInput === '') { 
        showSetupMessage("⚠️ Inserisci il tuo nome allo Step 1 prima di creare la stanza.", "error");
        return;
    }

    const btnCreate = document.getElementById('btn-create-room');
    btnCreate.classList.add('loading');
    btnCreate.disabled = true;

    roomId = generateRoomCode();
    myPlayerId = 0; 
    isOnline = true;

    const primoGiocatore = {
        id: 0, name: nameInput, token: tokenSelect, position: 0, money: 1500,
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
        
        // Nascondi Step 1 e Step 2, mostra solo la lobby
        document.getElementById('step-1-container').style.display = 'none';
        document.getElementById('step-2-container').style.display = 'none';
        
        document.getElementById('online-room-id-display').textContent = roomId;
        const lobby = document.getElementById('online-lobby-status');
        lobby.classList.remove('hidden-start');
        lobby.classList.add('fade-in');
        
        showSetupMessage(`🎉 Stanza creata! Invia il codice in basso ai tuoi amici.`, "success");
        ascoltaCambiamentiPartita();
    } catch (error) {
        console.error("Errore Firebase:", error);
        showSetupMessage("❌ Errore di rete. Controlla la tua connessione.", "error");
        resetBtn('btn-create-room', '✨ Crea Nuova Stanza');
    }
}

async function uniscitiStanza() {
    let nameInput = document.getElementById('playerName').value.trim();
    let tokenSelect = document.getElementById('playerToken').value;
    let codeInput = document.getElementById('roomCode').value.trim().toUpperCase();

    if (nameInput === '') { 
        showSetupMessage("⚠️ Inserisci il tuo nome allo Step 1 prima di entrare.", "error"); return;
    }
    if (codeInput === '') { 
        showSetupMessage("⚠️ Manca il codice della stanza! Fattelo inviare da chi l'ha creata.", "error"); return;
    }

    const btnJoin = document.getElementById('btn-join-room');
    btnJoin.classList.add('loading');
    btnJoin.disabled = true;

    try {
        const gameRef = window.db.collection("games").doc(codeInput);
        const doc = await gameRef.get();

        if (!doc.exists) {
            showSetupMessage("❌ Stanza inesistente! Controlla di aver scritto bene il codice.", "error");
            resetBtn('btn-join-room', '🚀 Unisciti'); return;
        }

        let data = doc.data();
        if (data.status === "playing") { 
            showSetupMessage("⛔ Partita già avviata! Non puoi più entrare.", "error"); 
            resetBtn('btn-join-room', '🚀 Unisciti'); return; 
        }
        if (data.players.length >= 6) { 
            showSetupMessage("⛔ Stanza piena! Ci sono già 6 giocatori.", "error"); 
            resetBtn('btn-join-room', '🚀 Unisciti'); return; 
        }
        if (data.players.some(p => p.token === tokenSelect)) { 
            showSetupMessage(`⚠️ La pedina ${tokenSelect} è già stata presa! Sceglila un'altra allo Step 1.`, "error"); 
            resetBtn('btn-join-room', '🚀 Unisciti'); return; 
        }

        roomId = codeInput;
        myPlayerId = data.players.length;
        isOnline = true;

        const nuovoGiocatore = {
            id: myPlayerId, name: nameInput, token: tokenSelect, position: 0, money: 1500,
            inJail: false, jailTurns: 0, isSkipped: false, isBankrupt: false, consecutiveDoubles: 0
        };

        data.players.push(nuovoGiocatore);
        await gameRef.update({ players: data.players });

        // Nascondi Step 1 e Step 2
        document.getElementById('step-1-container').style.display = 'none';
        document.getElementById('step-2-container').style.display = 'none';

        document.getElementById('online-room-id-display').textContent = roomId;
        const lobby = document.getElementById('online-lobby-status');
        lobby.classList.remove('hidden-start');
        lobby.classList.add('fade-in');
        
        showSetupMessage(`✅ Connesso con successo! In attesa che l'Host avvii la partita...`, "success");
        ascoltaCambiamentiPartita();
    } catch (error) {
        console.error("Errore:", error);
        showSetupMessage("❌ Errore durante la connessione al server.", "error");
        resetBtn('btn-join-room', '🚀 Unisciti');
    }
}

async function avviaPartitaOnline() {
    if (myPlayerId !== 0) return; 
    if (players.length < 2) { 
        showSetupMessage("⚠️ Servono almeno 2 giocatori nella stanza per iniziare!", "error"); 
        return; 
    }

    const btnStartOnline = document.getElementById('btn-start-online');
    btnStartOnline.classList.add('loading');
    btnStartOnline.disabled = true;

    try {
        const setupScreen = document.getElementById('setup-screen');
        setupScreen.classList.add('fade-out');
        
        setTimeout(() => {
            setupScreen.style.display = 'none';
            document.getElementById('game-ui').style.display = '';
        }, 400); 
        
        await window.db.collection("games").doc(roomId).update({ status: "playing" });
    } catch (e) { 
        console.error(e); 
        showSetupMessage("❌ Si è verificato un errore durante l'avvio.", "error");
        resetBtn('btn-start-online', '▶ Avvia la Partita! 🚀');
    }
}

// Abilita i pulsanti solo se l'utente ha scritto il nome
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('playerName');
    const btnAddLocal = document.getElementById('btn-add-local');
    const btnCreateRoom = document.getElementById('btn-create-room');
    const btnJoinRoom = document.getElementById('btn-join-room');

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            const hasName = nameInput.value.trim().length > 0;
            if (btnAddLocal) btnAddLocal.disabled = !hasName;
            if (btnCreateRoom) btnCreateRoom.disabled = !hasName;
            if (btnJoinRoom) btnJoinRoom.disabled = !hasName;
        });
    }
});