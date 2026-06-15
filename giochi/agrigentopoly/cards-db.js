// cards-db.js

// Database centralizzato delle carte di Agrigentopoly - Unico mazzo "A Sorte"
const carteSorte = [
    // --- CARTE POSITIVE ---
    { text: "È la domenica di San Calogero! Porti a spalla il Santo, i fedeli ti lanciano i motti di pane benedetto. La devozione ti premia: Ritira 50 €.", value: 50 },
    { text: "Hai vinto il primo premio per la migliore 'Arancina Rotonda della Città'. Incassa 100 €.", value: 100 },
    { text: "Ottimo raccolto di mandorle nei tuoi terreni a Giardina Gallotti. Vendi tutto in occasione della Sagra: guadagni 150 €.", value: 150 },
    { text: "Trovi parcheggio al primo colpo a San Leone la domenica sera di Ferragosto. È un vero miracolo: ritira 100 € dalla cassa comune.", value: 100 },
    { text: "Hai ripulito volontariamente un tratto di spiaggia a Maddalusa. Il Comune ti premia per l'enorme senso civico: ritira 50 €.", value: 50 },
    { text: "Hai affittato con successo la tua casa vacanze a San Leone per tutta la stagione estiva. Incassa 200 €.", value: 200 },
    { text: "Rimborso inaspettato dopo un ricalcolo sulle bollette idriche A.I.C.O.! Ritira 20 €.", value: 20 },
    { text: "Vinci l'agguerritissimo torneo di briscola al bar in piazza. La folla esulta: incassa 100 €.", value: 100 },
    { text: "Trovi un acquirente disposto a pagare a peso d'oro il tuo olio d'oliva extravergine appena franto. Incassa 150 €.", value: 150 },
    { text: "Partecipi come comparsa in un famoso spot girato alla Scala dei Turchi. La produzione ti paga 100 €.", value: 100 },
    { text: "Vinci il concorso fotografico della Valle dei Templi illuminata di notte. Ritira 80 €.", value: 80 },
    
    // --- CARTE NEGATIVE E IMPREVISTI ---
    { text: "Hai osato ordinare un 'arancino a punta' in un bar del centro. Il cameriere ti guarda malissimo e ti applica il supplemento offesa: Paga 50 €.", cost: 50 },
    { text: "Turnazione idrica saltata a Fontanelle! Devi chiamare d'urgenza un'autobotte privata. Paga 80 €.", cost: 80 },
    { text: "Ti sei avventurato sulla Rupe Atenea con le infradito e sei scivolato in malo modo. Paga 30 € di ticket sanitari.", cost: 30 },
    { text: "Autovelox piazzato a tradimento sul ponte Morandi! Andavi un po' troppo veloce. Paga 100 € di multa.", cost: 100 },
    { text: "Ti sei dimenticato di pagare la TARI al Comune entro la scadenza. Paga 50 € di mora.", cost: 50 },
    { text: "Crollo improvviso di un cornicione nel tuo stabile in centro storico. Paghi i lavori di messa in sicurezza urgenti: 150 €.", cost: 150 },
    { text: "Lavori interminabili sulla SS640 (Strada degli Scrittori). Prendi in pieno una buca e fori una gomma. Paga 100 € dal gommista.", cost: 100 },
    { text: "Hai lasciato l'auto in doppia fila in Via Atenea giusto il tempo di un caffè. I Vigili non perdonano, rimozione forzata: paga 80 €.", cost: 80 },
    { text: "Cenone di pesce a San Leone sfuggito totalmente di mano. Il conto è salatissimo: paga 120 €.", cost: 120 },
    
    // --- CARTE AZIONE (Spostamenti, Salti, Prigione) ---
    { text: "Rimani completamente bloccato nel traffico della Rotatoria degli Scrittori all'ora di punta. Sei in ritardo, perdi un turno!", cost: 0, action: "skip" },
    { text: "Multa grave per divieto di sosta al Quadrivio Spinasanta. Vai direttamente in Prigione (ex Carcere di San Vito) senza passare dal VIA.", cost: 0, action: "jail" },
    { text: "Scirocco record a 45 gradi! Scappa subito dall'afa della spiaggia di Cannatello e rifugiati all'ombra. Avanza fino a Porta di Ponte.", cost: 0, action: "jump", target: 1 },
    { text: "Ti sei perso passeggiando al tramonto nella Valle dei Templi e ti ritrovi all'ingresso principale. Vai direttamente al VIA (e ritira 200 €).", cost: 0, action: "jump", target: 0 }
];