const listaParole = ["Hamburger", "Roma", "Cane", "Zaino", "Dottore", "Sogno", "Pizza", "Parigi", "Leone", "Computer"];
let parolaScelta, nomeImpostore;
let punteggi = {};
let nomiInGioco = [];
let indexCorrente = 0;
let parolaRivelata = false;

function setupGioco() {
    const input = document.getElementById('input-nomi').value;
    const nomi = input.split(',').map(n => n.trim()).filter(n => n !== "");
    
    if (nomi.length < 3) {
        alert("Servono almeno 3 giocatori!");
        return;
    }

    nomi.forEach(n => punteggi[n] = 0);
    nuovoRound();
}

function nuovoRound() {
    nomiInGioco = Object.keys(punteggi);
    parolaScelta = listaParole[Math.floor(Math.random() * listaParole.length)];
    nomeImpostore = nomiInGioco[Math.floor(Math.random() * nomiInGioco.length)];
    indexCorrente = 0;
    
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('vote-screen').style.display = 'none';
    aggiornaUI();
    aggiornaClassifica();
}

function rivelaParola() {
    if (parolaRivelata) return;
    
    const box = document.getElementById('word-box');
    const giocatore = nomiInGioco[indexCorrente];
    
    // Aggiungiamo una classe CSS per cambiare lo stile al volo
    box.classList.add('revealed');
    
    if (giocatore === nomeImpostore) {
        box.innerHTML = `<span style="color:var(--danger); font-size:0.8rem">IL TUO RUOLO</span><br>IMPOSTORE`;
    } else {
        box.innerHTML = `<span style="color:var(--success); font-size:0.8rem">LA TUA PAROLA</span><br>${parolaScelta}`;
    }
    
    parolaRivelata = true;
    const btnNext = document.getElementById('btn-next');
    btnNext.style.display = 'block';
    btnNext.innerText = (indexCorrente === nomiInGioco.length - 1) ? "VAI ALLA VOTAZIONE" : "PROSSIMO GIOCATORE";
}

function prossimoTurno() {
    indexCorrente++;
    if (indexCorrente < nomiInGioco.size || indexCorrente < nomiInGioco.length) {
        parolaRivelata = false;
        aggiornaUI();
    } else {
        avviaVotazione();
    }
}

function avviaVotazione() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('vote-screen').style.display = 'block';
    const list = document.getElementById('vote-list');
    list.innerHTML = "";

    nomiInGioco.forEach(nome => {
        const btn = document.createElement('button');
        btn.className = "btn-vote";
        btn.innerText = nome;
        btn.onclick = () => processaVoto(nome);
        list.appendChild(btn);
    });
}

function processaVoto(votato) {
    if (votato === nomeImpostore) {
        alert("CIVILI VINCITORI! L'impostore era " + nomeImpostore);
        nomiInGioco.forEach(n => { if(n !== nomeImpostore) punteggi[n] += 1; });
        nuovoRound();
    } else {
        punteggi[votato] -= 1;
        nomiInGioco = nomiInGioco.filter(n => n !== votato);
        if (nomiInGioco.length <= 2) {
            alert("L'IMPOSTORE HA VINTO! Era " + nomeImpostore);
            punteggi[nomeImpostore] += 3;
            nuovoRound();
        } else {
            alert(votato + " era innocente! Continuate a votare.");
            avviaVotazione();
        }
    }
    aggiornaClassifica();
}

function aggiornaUI() {
    document.getElementById('current-player-name').innerText = "Giocatore: " + nomiInGioco[indexCorrente];
    const box = document.getElementById('word-box');
    box.innerText = "TOCCA PER VEDERE";
    box.style.color = "#fff";
    document.getElementById('btn-next').style.display = 'none';
}

function aggiornaClassifica() {
    const list = document.getElementById('punteggi-list');
    list.innerHTML = Object.entries(punteggi)
        .map(([nome, punti]) => `<li>${nome}: ${punti}</li>`).join("");
}