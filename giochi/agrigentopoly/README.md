# 🏛️ Agrigentopoly 🎲

Benvenuti ad **Agrigentopoly**, un'edizione digitale, interattiva e multiplayer del classico gioco da tavolo Monopoly, interamente ambientata nella magnifica città di Agrigento e dintorni!

Compra terreni in Via Atenea, gestisci la turnazione idrica con A.I.C.A., passeggia per San Leone e spera di non finire bloccato nel traffico del Villaggio Mosè. Scegli la tua pedina (L'Arancina, la Capra Girgentana, Il Telamone o La Quartara) e diventa il padrone assoluto della città!

## ✨ Caratteristiche Principali

* 🌍 **Multiplayer Ibrido:** Gioca in locale (passandovi il dispositivo) oppure **Online in tempo reale** sfruttando stanze private con codici di accesso.
* ⚖️ **Motore di Gioco Fedele:** Regole classiche implementate con precisione, tra cui:
  * Costruzione uniforme di Case e Alberghi.
  * Calcolo dinamico degli affitti (raddoppiati per colore completo, variabili in base alle utenze e alle stazioni).
  * Sistema di Ipoteca e Riscatto con interessi.
  * Prigione, cauzioni e meccaniche del lancio doppio.
  * Gestione completa della Bancarotta e trasferimento dei beni al creditore.
* 🔨 **Aste a Turni Continui (Real-Time):** Un potente sistema di aste asincrone appositamente studiato per il multiplayer online. I giocatori rilanciano a turno, possono "Passare" temporaneamente o scrivere "ESCI" per ritirarsi definitivamente. L'asta finisce solo quando tutti gli altri si arrendono, garantendo alta tensione e strategia!
* 🃏 **Carte Personalizzate:** Database di Probabilità e Imprevisti strutturato ad oggetti (senza rischio di disallineamento) e interamente riscritto con lore agrigentina (multe sul Viadotto Akragas, la domenica di San Calogero, sagre del mandorlo ecc.).

## 🛠️ Tecnologie Utilizzate

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+). Nessun framework pesante, garanzia di estrema leggerezza, velocità e manipolazione diretta del DOM.
* **Backend / Database:** [Firebase Firestore](https://firebase.google.com/) per il database in tempo reale, la sincronizzazione dello stato di gioco tra i client e la gestione della concorrenza (race conditions).

## 📂 Struttura del Codice (Architettura Modulare Estesa)

Il codice JavaScript è stato accuratamente diviso in micro-moduli per garantire la massima manutenibilità, separando la logica di gioco dal motore di rete:

**Core & Setup**
* `1-globals.js` - Dichiarazione delle variabili di stato globali e di sessione online.
* `2-database.js` - Configurazione del tabellone (proprietà, prezzi, affitti, costi di costruzione).
* `cards-db.js` - Database a oggetti contenente i testi e le logiche delle carte Probabilità e Imprevisti.
* `3-setup.js` - Inizializzazione della partita, aggiunta dei giocatori e scelta delle pedine.

**Motore di Gioco (Gameplay)**
* `4-ui.js` - Rendering dinamico del tabellone, dei badge proprietario e delle schede giocatore.
* `5-movement.js` - Logica del lancio dei dadi, gestione dei turni, prigione e movimento.
* `6-gameplay-actions.js` - Pesca delle carte, trigger degli eventi sulle caselle e pagamenti automatici.

**Economia & Mercato (Moduli 7)**
* `7a-economy-management.js` - Menu interattivo del giocatore: ipoteche, riscatti e vendita di case.
* `7b-economy-auctions.js` - Inizializzazione e cicli del motore delle aste (sia per le proprietà della Banca che tra giocatori).
* `7c-economy-utils.js` - Funzioni matematiche e di controllo (calcolo affitti dinamici, check sui monopoli, sistema di bancarotta).

**Networking & Multiplayer (Moduli 8)**
* `8a-multiplayer-setup.js` - Creazione delle stanze online, generazione codici univoci e join degli ospiti.
* `8b-multiplayer-sync.js` - Sistema di invio (Push) dello stato locale verso il cloud di Firebase.
* `8c-multiplayer-listener.js` - Il listener (`onSnapshot`) che ascolta passivamente il server e aggiorna l'UI in tempo reale.
* `8d-multiplayer-events.js` - Gestore degli eventi asincroni complessi (es. apertura dei popup d'asta sul client a cui tocca rilanciare).

## 🚀 Installazione e Avvio

1. **Clona la repository:**
   ```bash
   git clone [https://github.com/tuo-username/agrigentopoly.git](https://github.com/tuo-username/agrigentopoly.git)