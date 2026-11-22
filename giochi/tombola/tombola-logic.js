// Smorfia Napoletana (1 - 90)
const smorfiaNapoletana = {
    1: "L'Italia", 2: "'A piccerella (La bambina)", 3: "'A jatta (La gatta)", 4: "'O puorco (Il maiale)",
    5: "'A mano (La mano)", 6: "Chella ca guarda 'nterra", 7: "'O vasillo (Il vaso)", 8: "'A Maronna (La Madonna)",
    9: "'A figliata (La prole)", 10: "'E fasule (I fagioli)", 11: "'E suricille (I topolini)", 12: "'E surdate (I soldati)",
    13: "Sant'Antonio", 14: "'O mbriaco (L'ubriaco)", 15: "'O guaglione (Il ragazzo)", 16: "'O culo",
    17: "'A disgrazia (La disgrazia)", 18: "'O sanghe (Il sangue)", 19: "'A resata (La risata)", 20: "'A festa (La festa)",
    21: "'A femmena annura (La donna nuda)", 22: "'O pazzo (Il pazzo)", 23: "'O scemo (Lo scemo)", 24: "'E gguardie (Le guardie)",
    25: "Natale", 26: "Nanninella (Sant'Anna)", 27: "'O càntaro (Il vaso da notte)", 28: "'E zzizze (Il seno)",
    29: "'O pate d''e ccriature", 30: "'E ppalle d''o tenente", 31: "'O padrone 'e casa", 32: "'O capitone (Il capitone)",
    33: "Ll'anne 'e Cristo (Gli anni di Cristo)", 34: "'A capa (La testa)", 35: "L'aucielluzzo (L'uccellino)", 36: "'E ccastagnelle (Le nacchere)",
    37: "'O monaco (Il monaco)", 38: "'E mmazzate (Le botte)", 39: "'A funa 'nganna (La corda al collo)", 40: "'A paposcia (L'ernia)",
    41: "'O curtiello (Il coltello)", 42: "'O ccafè (Il caffè)", 43: "Onna pereta fore 'o barcone", 44: "'E ccancelle (Le carceri)",
    45: "'O vino bbuono (Il vino buono)", 46: "'E denare (I soldi)", 47: "'O muorto (Il morto)", 48: "'O muorto che pparla",
    49: "'O piezzo 'e carne", 50: "'O ppane (Il pane)", 51: "'O ciardino (Il giardino)", 52: "'A mamma (La mamma)",
    53: "'O viecchio (Il vecchio)", 54: "'O cappiello (Il cappello)", 55: "'A museca (La musica)", 56: "'A caruta (La caduta)",
    57: "'O scartellato (Il gobbo)", 58: "'O paccotto (Il pacco)", 59: "'E pile (I peli)", 60: "Se lamenta (Si lamenta)",
    61: "'O cacciatore (Il cacciatore)", 62: "'O muorto acciso (Il morto ammazzato)", 63: "'A sposa (La sposa)", 64: "'A sciammeria (La marsina)",
    65: "'O chianto (Il pianto)", 66: "'E ddoie zetelle (Le due zitelle)", 67: "'O totaro int''a chitarra", 68: "'A zuppa cotta",
    69: "Sott'e 'ncoppa (Sottosopra)", 70: "'O palazzo (Il palazzo)", 71: "L'ommo 'e merda", 72: "'A maraviglia (La meraviglia)",
    73: "'O spitale (L'ospedale)", 74: "'A rotta (La grotta)", 75: "Pullecenella (Pulcinella)", 76: "'A funtana (La fontana)",
    77: "'E diavulille (I diavoletti)", 78: "'A bella figliola", 79: "'O mariuolo (Il ladro)", 80: "'A vocca (La bocca)",
    81: "'E sciure (I fiori)", 82: "'A tavula 'mbandita", 83: "'O maletiempo (Il maltempo)", 84: "'A cchiesa (La chiesa)",
    85: "Ll'aneme d''o Priatorio", 86: "'A puteca (Il negozio)", 87: "'E perucchie (I pidocchi)", 88: "'E casecavalle (I caciocavalli)",
    89: "'A vecchia (La vecchia)", 90: "'A paura (La paura)"
};

// Stato del gioco
let numeriDisponibili = [];
let numeriEstratti = [];
let cartelleGiocatore = [];
let modalita = "board"; // "board" o "player"
let estrazioneAutomatica = true;
let premiAssegnati = {
    2: false, // Ambo
    3: false, // Terno
    4: false, // Quaterna
    5: false, // Cinquina
    15: false // Tombola
};

// Inizializza la griglia del Tabellone 1-90
function creaTabelloneUI() {
    const grid = document.getElementById("tabellone-grid");
    grid.innerHTML = "";
    for (let i = 1; i <= 90; i++) {
        const cell = document.createElement("div");
        cell.className = "board-cell";
        cell.id = `board-num-${i}`;
        cell.textContent = i;
        cell.onclick = () => toggleNumeroManualeSulTabellone(i);
        grid.appendChild(cell);
    }
}

// Avvia modalità SOLO TABELLONE
function avviaModalitaTabellone() {
    modalita = "board";
    estrazioneAutomatica = true;
    inizializzaPartita();

    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("btn-change-mode").classList.remove("hidden");

    document.getElementById("player-cards-section").classList.add("hidden");
    document.getElementById("tabellone-section").classList.remove("hidden");
    document.getElementById("play-area").classList.add("only-board");

    document.getElementById("btn-extract").classList.remove("hidden");
    document.getElementById("manual-input-box").classList.add("hidden");
    document.getElementById("btn-toggle-board").classList.add("hidden");
}

// Avvia modalità GIOCATORE CON CARTELLE
function avviaModalitaGiocatore() {
    modalita = "player";
    const numCartelle = parseInt(document.getElementById("num-cartelle").value, 10);
    estrazioneAutomatica = document.getElementById("chk-auto-extract").checked;

    inizializzaPartita();
    generaCartelleGiocatore(numCartelle);

    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("btn-change-mode").classList.remove("hidden");

    document.getElementById("player-cards-section").classList.remove("hidden");
    document.getElementById("tabellone-section").classList.remove("hidden");
    document.getElementById("play-area").classList.remove("only-board");
    document.getElementById("btn-toggle-board").classList.remove("hidden");

    if (estrazioneAutomatica) {
        document.getElementById("btn-extract").classList.remove("hidden");
        document.getElementById("manual-input-box").classList.add("hidden");
    } else {
        document.getElementById("btn-extract").classList.add("hidden");
        document.getElementById("manual-input-box").classList.remove("hidden");
    }
}

function tornaAlMenu() {
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("btn-change-mode").classList.add("hidden");
    document.getElementById("setup-screen").classList.remove("hidden");
}

function inizializzaPartita() {
    numeriDisponibili = Array.from({ length: 90 }, (_, i) => i + 1);
    numeriEstratti = [];
    premiAssegnati = { 2: false, 3: false, 4: false, 5: false, 15: false };

    document.getElementById("current-number").textContent = "--";
    document.getElementById("smorfia-text").textContent = "Pronto per iniziare!";
    document.getElementById("extracted-count").textContent = "0";
    document.getElementById("remaining-count").textContent = "90";
    document.getElementById("last-numbers-list").innerHTML = "";

    document.querySelectorAll(".prize-badge").forEach(b => b.classList.remove("won"));
    creaTabelloneUI();
}

function resetPartita() {
    if (!confirm("Vuoi iniziare una nuova partita? I numeri estratti verranno azzerati.")) return;
    if (modalita === "board") {
        avviaModalitaTabellone();
    } else {
        avviaModalitaGiocatore();
    }
}

// Estrazione casuale
function estraiNumero() {
    if (numeriDisponibili.length === 0) {
        alert("Tutti i 90 numeri sono stati estratti!");
        return;
    }

    const randomIndex = Math.floor(Math.random() * numeriDisponibili.length);
    const numero = numeriDisponibili.splice(randomIndex, 1)[0];
    registraNumeroEstratto(numero);
}

// Inserimento manuale (quando si usa il panariello fisico)
function inserisciNumeroManuale() {
    const input = document.getElementById("manual-number-input");
    const num = parseInt(input.value, 10);
    input.value = "";

    if (isNaN(num) || num < 1 || num > 90) {
        alert("Inserisci un numero valido tra 1 e 90.");
        return;
    }
    if (numeriEstratti.includes(num)) {
        alert(`Il numero ${num} è già stato estratto!`);
        return;
    }

    numeriDisponibili = numeriDisponibili.filter(n => n !== num);
    registraNumeroEstratto(num);
}

// Clic diretto su una casella del tabellone
function toggleNumeroManualeSulTabellone(num) {
    if (numeriEstratti.includes(num)) {
        if (confirm(`Vuoi annullare l'estrazione del numero ${num}?`)) {
            numeriEstratti = numeriEstratti.filter(n => n !== num);
            numeriDisponibili.push(num);
            aggiornaUITabellone();
        }
    } else {
        numeriDisponibili = numeriDisponibili.filter(n => n !== num);
        registraNumeroEstratto(num);
    }
}

function registraNumeroEstratto(numero) {
    numeriEstratti.push(numero);

    // Aggiorna pallina principale e Smorfia
    const ball = document.getElementById("current-number");
    ball.textContent = numero;
    ball.classList.remove("pop");
    void ball.offsetWidth; // trigger reflow animazione
    ball.classList.add("pop");

    document.getElementById("smorfia-text").textContent = `"${smorfiaNapoletana[numero]}"`;
    aggiornaUITabellone();

    // Se in modalità giocatore con spunta automatica, segna il numero sulle cartelle
    if (modalita === "player" && document.getElementById("chk-auto-mark").checked) {
        segnaNumeroSulleCartelle(numero);
    }
}

function aggiornaUITabellone() {
    document.getElementById("extracted-count").textContent = numeriEstratti.length;
    document.getElementById("remaining-count").textContent = 90 - numeriEstratti.length;

    // Aggiorna ultimi 5 numeri usciti
    const historyContainer = document.getElementById("last-numbers-list");
    historyContainer.innerHTML = "";
    const ultimi = numeriEstratti.slice(-5).reverse();
    ultimi.forEach(n => {
        const span = document.createElement("span");
        span.className = "mini-ball";
        span.textContent = n;
        historyContainer.appendChild(span);
    });

    // Aggiorna celle del tabellone
    const ultimoEstratto = numeriEstratti[numeriEstratti.length - 1];
    for (let i = 1; i <= 90; i++) {
        const cell = document.getElementById(`board-num-${i}`);
        cell.classList.remove("extracted", "last-extracted");
        if (numeriEstratti.includes(i)) {
            cell.classList.add("extracted");
            if (i === ultimoEstratto) {
                cell.classList.add("last-extracted");
            }
        }
    }
}

// Mostra / Nascondi tabellone durante la partita
function toggleTabelloneMobile() {
    const tabSection = document.getElementById("tabellone-section");
    tabSection.classList.toggle("hidden");
}

// --- LOGICA GENERAZIONE CARTELLE TOMBOLA ---
function generaCartelleGiocatore(quantita) {
    const container = document.getElementById("cards-container");
    container.innerHTML = "";
    cartelleGiocatore = [];

    for (let c = 0; c < quantita; c++) {
        const matrice = creaMatriceCartella();
        cartelleGiocatore.push({ id: c + 1, grid: matrice, marked: new Set() });
        renderizzaCartella(c, matrice, container);
    }
}

function creaMatriceCartella() {
    // 3 righe x 9 colonne, 5 numeri per riga
    const grid = Array.from({ length: 3 }, () => Array(9).fill(null));
    
    // Scegli 5 colonne per ciascuna delle 3 righe garantendo almeno 1 numero per colonna
    let colCounts = Array(9).fill(0);
    let rowCols = [[], [], []];

    // Assegna prima 1 numero per colonna
    for (let col = 0; col < 9; col++) {
        const r = Math.floor(Math.random() * 3);
        rowCols[r].push(col);
        colCounts[col]++;
    }

    // Completa ogni riga fino a 5 colonne
    for (let r = 0; r < 3; r++) {
        while (rowCols[r].length < 5) {
            const col = Math.floor(Math.random() * 9);
            if (!rowCols[r].includes(col) && colCounts[col] < 3) {
                rowCols[r].push(col);
                colCounts[col]++;
            }
        }
    }

    // Genera numeri univoci ordinati per ogni colonna
    for (let col = 0; col < 9; col++) {
        const min = col === 0 ? 1 : col * 10;
        const max = col === 8 ? 90 : col * 10 + 9;
        const pool = [];
        for (let n = min; n <= max; n++) pool.push(n);

        // Estrai colCounts[col] numeri e ordinali
        const scelti = [];
        for (let k = 0; k < colCounts[col]; k++) {
            const idx = Math.floor(Math.random() * pool.length);
            scelti.push(pool.splice(idx, 1)[0]);
        }
        scelti.sort((a, b) => a - b);

        let idxScelto = 0;
        for (let r = 0; r < 3; r++) {
            if (rowCols[r].includes(col)) {
                grid[r][col] = scelti[idxScelto++];
            }
        }
    }

    return grid;
}

function renderizzaCartella(cardIndex, matrice, container) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "tombola-card";

    const header = document.createElement("div");
    header.className = "tombola-card-header";
    header.innerHTML = `<span>Cartella #${cardIndex + 1}</span><span id="card-status-${cardIndex}">0 / 15</span>`;
    cardDiv.appendChild(header);

    const rowsDiv = document.createElement("div");
    rowsDiv.className = "card-rows";

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 9; c++) {
            const val = matrice[r][c];
            const cell = document.createElement("div");
            cell.className = "card-cell";
            if (val !== null) {
                cell.textContent = val;
                cell.classList.add("has-number");
                cell.id = `card-${cardIndex}-num-${val}`;
                cell.onclick = () => toggleNumeroCartella(cardIndex, val);
            } else {
                cell.classList.add("empty");
            }
            rowsDiv.appendChild(cell);
        }
    }

    cardDiv.appendChild(rowsDiv);
    container.appendChild(cardDiv);
}

function toggleNumeroCartella(cardIndex, num) {
    const card = cartelleGiocatore[cardIndex];
    const cell = document.getElementById(`card-${cardIndex}-num-${num}`);

    if (card.marked.has(num)) {
        card.marked.delete(num);
        cell.classList.remove("marked");
    } else {
        card.marked.add(num);
        cell.classList.add("marked");
    }

    aggiornaStatoCartella(cardIndex);
}

function segnaNumeroSulleCartelle(num) {
    cartelleGiocatore.forEach((card, idx) => {
        const cell = document.getElementById(`card-${idx}-num-${num}`);
        if (cell && !card.marked.has(num)) {
            card.marked.add(num);
            cell.classList.add("marked");
            aggiornaStatoCartella(idx);
        }
    });
}

function aggiornaStatoCartella(cardIndex) {
    const card = cartelleGiocatore[cardIndex];
    document.getElementById(`card-status-${cardIndex}`).textContent = `${card.marked.size} / 15`;

    // Controlla vincite sulle righe (Ambo, Terno, Quaterna, Cinquina)
    for (let r = 0; r < 3; r++) {
        let segnatiRiga = 0;
        for (let c = 0; c < 9; c++) {
            const val = card.grid[r][c];
            if (val !== null && card.marked.has(val)) {
                segnatiRiga++;
            }
        }
        verificaPremio(segnatiRiga, cardIndex + 1);
    }

    // Controlla Tombola (15 numeri)
    if (card.marked.size === 15) {
        verificaPremio(15, cardIndex + 1);
    }
}

function verificaPremio(punti, numeroCartella) {
    const nomiPremi = {
        2: { id: "prize-ambo", nome: "AMBO" },
        3: { id: "prize-terno", nome: "TERNO" },
        4: { id: "prize-quaterna", nome: "QUATERNA" },
        5: { id: "prize-cinquina", nome: "CINQUINA" },
        15: { id: "prize-tombola", nome: "TOMBOLA" }
    };

    if (nomiPremi[punti] && !premiAssegnati[punti]) {
        premiAssegnati[punti] = true;
        document.getElementById(nomiPremi[punti].id).classList.add("won");
        mostraPopupVincita(nomiPremi[punti].nome, numeroCartella);
    }
}

function mostraPopupVincita(nomePremio, numeroCartella) {
    document.getElementById("win-title").textContent = `🎉 HAI FATTO ${nomePremio}!`;
    document.getElementById("win-message").textContent = `Complimenti! Hai realizzato ${nomePremio} sulla Cartella #${numeroCartella}.`;
    document.getElementById("win-modal").classList.remove("hidden");
}

function chiudiModal() {
    document.getElementById("win-modal").classList.add("hidden");
}