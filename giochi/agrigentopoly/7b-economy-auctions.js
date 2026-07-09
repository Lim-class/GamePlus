// 7b-economy-auctions.js

function startPlayerAuction(sellerIndex, position) {
    let space = boardSpaces[position];
    let seller = players[sellerIndex];

    if (space.houses > 0) {
        alert("Non puoi mettere all'asta un terreno edificato! Vendi prima tutte le case/alberghi.");
        return;
    }

    let basePriceInput = prompt(`A che prezzo (in €) vuoi far partire l'asta per ${space.name}?`);
    if (!basePriceInput) return; 
    
    let currentBid = parseInt(basePriceInput);
    if (isNaN(currentBid) || currentBid < 0) currentBid = 0;

    let activeBidders = players.filter(p => !p.isBankrupt && p.id !== sellerIndex);

    if (activeBidders.length === 0) {
        alert("Non ci sono altri giocatori attivi per l'asta.");
        return;
    }

    // --- LOGICA ONLINE: INIZIALIZZA ASTA LUNGA A TURNI ---
    if (isOnline) {
        if (auctionData !== null) {
            alert("C'è già un'asta in corso sul server. Attendi.");
            return;
        }
        
        auctionData = {
            status: "active",
            type: "player",
            sellerId: sellerIndex,
            propertyPos: position,
            currentBid: currentBid,
            highestBidder: null,
            activeBidders: activeBidders.map(p => p.id),
            turnIndex: 0,
            consecutivePasses: 0, 
            winnerId: null,
            finalPrice: 0
        };

        alert(`🔨 Asta iniziata! Il sistema chiederà le offerte a turno. Se nessuno rilancia dopo di te, vinci.`);
        saveGame();
        return;
    }

    // --- LOGICA OFFLINE: CICLO LUNGO ---
    let highestBidder = null;
    let consecutivePasses = 0;
    let turnIndex = 0;
    
    alert(`🔨 INIZIA L'ASTA PRIVATA DI ${seller.name} PER: ${space.name}! (Base: ${currentBid} €)`);

    while (true) {
        let bidder = activeBidders[turnIndex];

        let input = prompt(`Asta Privata: ${space.name}\nOfferta attuale: ${currentBid} € (${highestBidder ? highestBidder.name : 'Nessuno'})\n\n${bidder.name}, offri di più, lascia vuoto per PASSARE, o scrivi "ESCI" per ritirarti del tutto.`);
        
        if (input !== null && input.trim().toUpperCase() === "ESCI") {
            alert(`${bidder.name} si ritira definitivamente dall'asta!`);
            activeBidders.splice(turnIndex, 1);
            if (turnIndex >= activeBidders.length && activeBidders.length > 0) {
                 turnIndex = 0;
            }
        } else if (!input || input.trim() === "") {
            alert(`${bidder.name} passa il turno.`);
            consecutivePasses++;
            turnIndex = (turnIndex + 1) % activeBidders.length;
        } else {
            let bidAmount = parseInt(input);
            if (!isNaN(bidAmount) && bidAmount > currentBid && bidAmount <= bidder.money) {
                currentBid = bidAmount;
                highestBidder = bidder;
                consecutivePasses = 0; 
                turnIndex = (turnIndex + 1) % activeBidders.length;
            } else {
                alert("Offerta non valida o fondi insufficienti. Riprova con una cifra maggiore.");
                continue; 
            }
        }

        if (activeBidders.length === 0) break;
        if (activeBidders.length === 1 && highestBidder !== null) break;
        if (highestBidder === null && consecutivePasses >= activeBidders.length) break; 
        if (highestBidder !== null && consecutivePasses >= activeBidders.length - 1) break; 
    }

    if (highestBidder) {
        highestBidder.money -= currentBid; 
        seller.money += currentBid;
        space.owner = highestBidder.id;
        alert(`🎉 AGGIUDICATO! ${highestBidder.name} compra ${space.name} da ${seller.name} per ${currentBid} €!`);
        updatePlayersUI(); updateSpaceVisuals(position);
    } else {
        alert(`Nessuno ha fatto offerte valide. ${space.name} resta a ${seller.name}.`);
    }
    saveGame();
}

function startAuction(position) {
    let space = boardSpaces[position];
    let currentBid = 10;
    let activeBidders = players.filter(p => !p.isBankrupt);

    // --- LOGICA ONLINE: INIZIALIZZA ASTA LUNGA (BANCA) ---
    if (isOnline) {
        if (auctionData !== null) {
            alert("Asta in corso. Attendi...");
            return;
        }

        auctionData = {
            status: "active",
            type: "bank",
            sellerId: null,
            propertyPos: position,
            currentBid: 10,
            highestBidder: null,
            activeBidders: activeBidders.map(p => p.id),
            turnIndex: 0,
            consecutivePasses: 0,
            winnerId: null,
            finalPrice: 0
        };

        alert(`🔨 La Banca mette all'Asta ${space.name}! (Base: 10 €). Il sistema gestirà i turni continui.`);
        saveGame();
        return;
    }

    // --- LOGICA OFFLINE: CICLO LUNGO (BANCA) ---
    let highestBidder = null;
    let consecutivePasses = 0;
    let turnIndex = 0;
    alert(`🔨 INIZIA L'ASTA PER: ${space.name}! (Base: 10 €)`);

    while (true) {
        let bidder = activeBidders[turnIndex];

        let input = prompt(`Asta: ${space.name}\nOfferta attuale: ${currentBid} € (${highestBidder ? highestBidder.name : 'Nessuno'})\n\n${bidder.name}, offri di più, lascia vuoto per PASSARE, o scrivi "ESCI" per ritirarti del tutto.`);
        
        if (input !== null && input.trim().toUpperCase() === "ESCI") {
            alert(`${bidder.name} si ritira dall'asta!`);
            activeBidders.splice(turnIndex, 1);
            if (turnIndex >= activeBidders.length && activeBidders.length > 0) turnIndex = 0;
        } else if (!input || input.trim() === "") {
            alert(`${bidder.name} passa.`);
            consecutivePasses++;
            turnIndex = (turnIndex + 1) % activeBidders.length;
        } else {
            let bidAmount = parseInt(input);
            if (!isNaN(bidAmount) && bidAmount > currentBid && bidAmount <= bidder.money) {
                currentBid = bidAmount; 
                highestBidder = bidder;
                consecutivePasses = 0;
                turnIndex = (turnIndex + 1) % activeBidders.length;
            } else {
                alert("Offerta non valida o fondi insufficienti. Riprova con una cifra maggiore.");
                continue;
            }
        }

        if (activeBidders.length === 0) break;
        if (activeBidders.length === 1 && highestBidder !== null) break;
        if (highestBidder === null && consecutivePasses >= activeBidders.length) break;
        if (highestBidder !== null && consecutivePasses >= activeBidders.length - 1) break;
    }

    if (highestBidder) {
        highestBidder.money -= currentBid; space.owner = highestBidder.id;
        alert(`🎉 AGGIUDICATO! ${highestBidder.name} compra ${space.name} per ${currentBid} €!`);
        updatePlayersUI(); updateSpaceVisuals(position);
    } else {
        alert("Nessuno ha fatto offerte. Il terreno resta alla Banca.");
    }
    saveGame();
}