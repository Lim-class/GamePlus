/* impiccato-logic.js */
const dizionario = ["ANDROID", "SMARTPHONE", "PROGRAMMAZIONE", "TASTIERA", "GIOCO", "SUDOKU", "COMPUTER", "INTERNET", "STUDIO", "SVILUPPO"];
let parolaSegreta = "";
let parolaVisualizzata = [];
let errori = 0;
const MAX_ERRORI = 6;
let modalita = "";

function setMode(mode) {
    modalita = mode;
    document.getElementById('selection-screen').style.display = 'none';
    
    if (mode === 'pc') {
        parolaSegreta = dizionario[Math.floor(Math.random() * dizionario.length)];
        startGame();
    } else {
        document.getElementById('setup-screen').style.display = 'block';
    }
}

function startTwoPlayerGame() {
    const input = document.getElementById('secret-word-input');
    const word = input.value.toUpperCase().trim();
    
    if (word.length < 2 || !/^[A-Z]+$/.test(word)) {
        alert("Inserisci una parola valida (minimo 2 lettere, solo A-Z)");
        return;
    }
    
    parolaSegreta = word;
    input.value = "";
    document.getElementById('setup-screen').style.display = 'none';
    startGame();
}

function startGame() {
    errori = 0;
    parolaVisualizzata = new Array(parolaSegreta.length).fill("_");
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('letter-input').disabled = false;
    document.getElementById('btn-guess').disabled = false;
    document.getElementById('message').innerText = "INDIVINA LA PAROLA";
    document.getElementById('message').style.color = "#fff";
    updateUI();
}

function updateUI() {
    document.getElementById('word-display').innerText = parolaVisualizzata.join("");
    
    // Gestione Vite con Emoji (come ImpiccatoActivity.java)
    let viteUI = "Vite: ";
    for (let i = 0; i < MAX_ERRORI; i++) {
        viteUI += (i < (MAX_ERRORI - errori)) ? "❤️ " : "🖤 ";
    }
    document.getElementById('lives-container').innerText = viteUI;
}

function makeGuess() {
    const input = document.getElementById('letter-input');
    const lettera = input.value.toUpperCase().trim();
    input.value = "";
    input.focus();

    if (!lettera || !/[A-Z]/.test(lettera)) return;

    let trovata = false;
    for (let i = 0; i < parolaSegreta.length; i++) {
        if (parolaSegreta[i] === lettera) {
            parolaVisualizzata[i] = lettera;
            trovata = true;
        }
    }

    if (!trovata) {
        errori++;
    }

    updateUI();
    checkGameOver();
}

function checkGameOver() {
    const vinto = !parolaVisualizzata.includes("_");
    const perso = errori >= MAX_ERRORI;

    if (vinto || perso) {
        document.getElementById('letter-input').disabled = true;
        document.getElementById('btn-guess').disabled = true;
        
        const msg = document.getElementById('message');
        if (vinto) {
            msg.innerText = "🎉 VITTORIA ECCELLENTE!";
            msg.style.color = "#00ff88";
        } else {
            msg.innerText = "💀 GAME OVER! ERA: " + parolaSegreta;
            msg.style.color = "#e94560";
        }
    }
}

function resetToMenu() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('selection-screen').style.display = 'block';
}

// Consente l'invio premendo "Invio" sulla tastiera
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.getElementById('game-screen').style.display === 'block') {
        makeGuess();
    }
});