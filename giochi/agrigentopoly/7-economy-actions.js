// 7-economy-actions.js
function manageProperties(playerIndex) {
    if (isOnline && playerIndex !== myPlayerId) {
        alert("Non puoi gestire i beni degli altri giocatori!");
        return;
    }

    let p = players[playerIndex];
    let ownedPositions = Object.keys(boardSpaces).filter(pos => boardSpaces[pos].owner === playerIndex);
    
    if(ownedPositions.length === 0) {
        alert("Non possiedi alcuna proprietà.");
        return;
    }

    let listStr = ownedPositions.map(pos => `${pos}: ${boardSpaces[pos].name} (Case: ${boardSpaces[pos].houses || 0}, Ipoteca: ${boardSpaces[pos].mortgaged ? 'Sì' : 'No'})`).join('\n');
    let input = prompt(`--- PATRIMONIO DI ${p.name} ---\n${listStr}\n\nInserisci il NUMERO della proprietà che vuoi gestire:`);
    
    if(!input) return;
    
    let pos = parseInt(input);
    if(ownedPositions.includes(pos.toString())) {
        let space = boardSpaces[pos];
        // Aggiunta l'opzione 3 per l'asta
        let action = prompt(`Gestione: ${space.name}\n1: Ipoteca / Riscatta Terreno\n2: Vendi 1 Casa/Albergo (+${space.housePrice ? space.housePrice/2 : 0} €)\n3: Metti all'Asta tra i giocatori\n\nDigita 1, 2 o 3:`);
        
        if(action === '1') toggleMortgage(playerIndex, pos);
        else if(action === '2') sellHouse(playerIndex, pos);
        else if(action === '3') startPlayerAuction(playerIndex, pos);
    } else {
        alert("Proprietà non trovata nel tuo portafoglio.");
    }
}

function startPlayerAuction(sellerIndex, position) {
    let space = boardSpaces[position];
    let seller = players[sellerIndex];

    // Controllo: non puoi vendere un terreno se ci sono case
    if (space.houses > 0) {
        alert("Non puoi mettere all'asta un terreno edificato! Vendi prima tutte le case/alberghi.");
        return;
    }

    // Chiede al venditore la base d'asta
    let basePriceInput = prompt(`A che prezzo (in €) vuoi far partire l'asta per ${space.name}?`);
    if (!basePriceInput) return; // Se annulla, esci
    
    let currentBid = parseInt(basePriceInput);
    if (isNaN(currentBid) || currentBid < 0) currentBid = 0;

    let highestBidder = null;
    // Partecipano tutti i giocatori attivi tranne il venditore
    let activeBidders = players.filter(p => !p.isBankrupt && p.id !== sellerIndex);

    if (activeBidders.length === 0) {
        alert("Non ci sono altri giocatori attivi per l'asta.");
        return;
    }

    alert(`🔨 INIZIA L'ASTA PRIVATA DI ${seller.name} PER: ${space.name}! (Base: ${currentBid} €)`);

    // Semplificazione asta online (come quella di base)
    if (isOnline) {
        alert("Attenzione: L'asta tra giocatori online non è pienamente supportata. Contatta gli altri in chat/voce e fai lo scambio manuale tramite la banca.");
        return;
    }

    // Ciclo dell'asta
    while (activeBidders.length > 0) {
        for (let i = 0; i < activeBidders.length; i++) {
            let bidder = activeBidders[i];
            
            // Se è rimasto un solo bidder e ha già fatto l'offerta massima, vince
            if (activeBidders.length === 1 && highestBidder !== null) {
                activeBidders = []; 
                break;
            }

            let input = prompt(`Asta Privata: ${space.name}\nOfferta attuale: ${currentBid} € (${highestBidder ? highestBidder.name : 'Nessuno'})\n\n${bidder.name}, offri di più o lascia vuoto per RITIRARTI.`);
            
            if (!input || input.trim() === "") {
                alert(`${bidder.name} si ritira dall'asta!`);
                activeBidders.splice(i, 1); 
                i--;
            } else {
                let bidAmount = parseInt(input);
                if (!isNaN(bidAmount) && bidAmount > currentBid && bidAmount <= bidder.money) {
                    currentBid = bidAmount; 
                    highestBidder = bidder;
                } else {
                    alert("Offerta non valida o fondi insufficienti. Ti sei ritirato.");
                    activeBidders.splice(i, 1); 
                    i--;
                }
            }
        }
    }

    // Fine dell'asta: assegna la proprietà e trasferisci i soldi
    if (highestBidder) {
        highestBidder.money -= currentBid; 
        seller.money += currentBid; // Il venditore incassa i soldi dell'asta
        space.owner = highestBidder.id;
        
        alert(`🎉 AGGIUDICATO! ${highestBidder.name} compra ${space.name} da ${seller.name} per ${currentBid} €!`);
        updatePlayersUI(); 
        updateSpaceVisuals(position);
    } else {
        alert(`Nessuno ha fatto offerte valide. ${space.name} resta a ${seller.name}.`);
    }
    
    saveGame();
}

function toggleMortgage(playerIndex, position) {
    let space = boardSpaces[position];
    if (space.houses > 0) {
        alert("Non puoi ipotecare un terreno edificato! Vendi prima tutte le case.");
        return;
    }

    if (!space.mortgaged) {
        let mortgageValue = space.price / 2;
        space.mortgaged = true;
        changeMoney(playerIndex, mortgageValue);
        alert(`Hai ipotecato ${space.name}. La Banca ti eroga ${mortgageValue} €.`);
    } else {
        let unmortgageCost = (space.price / 2) * 1.1; 
        if (players[playerIndex].money >= unmortgageCost) {
            space.mortgaged = false;
            changeMoney(playerIndex, -unmortgageCost);
            alert(`Hai riscattato ${space.name} pagando ${unmortgageCost} € (inclusi interessi).`);
        } else {
            alert(`Fondi insufficienti per riscattare. Ti servono ${unmortgageCost} €.`);
        }
    }
    updateSpaceVisuals(position);
    saveGame();
}

function sellHouse(playerIndex, position) {
    let space = boardSpaces[position];
    if (space.type !== "property" || space.houses === 0) {
        alert("Non ci sono case da vendere su questa proprietà.");
        return;
    }
    let refund = space.housePrice / 2;
    space.houses--;
    changeMoney(playerIndex, refund);
    alert(`Hai venduto un immobile su ${space.name}. Recuperi ${refund} €.`);
    updateSpaceVisuals(position);
    saveGame();
}

function ownsColorSet(playerIndex, groupName) {
    let spacesInGroup = Object.values(boardSpaces).filter(s => s.group === groupName);
    return spacesInGroup.every(s => s.owner === playerIndex);
}

function canBuildUniformly(groupName, currentHouses) {
    let spacesInGroup = Object.values(boardSpaces).filter(s => s.group === groupName);
    return spacesInGroup.every(s => s.houses >= currentHouses);
}

function calculateRent(position) {
    let space = boardSpaces[position];
    if (space.mortgaged) return 0; 
    
    if (space.type === "property") {
        let rent = space.rent[space.houses];
        if (space.houses === 0 && ownsColorSet(space.owner, space.group)) rent *= 2;
        return rent;
    }
    if (space.type === "transport" || space.type === "special") {
        let count = Object.values(boardSpaces).filter(s => s.type === space.type && s.owner === space.owner).length;
        return space.rent[count - 1] || space.rent[0];
    }
    if (space.type === "utility") {
        let count = Object.values(boardSpaces).filter(s => s.type === "utility" && s.owner === space.owner).length;
        return count === 2 ? 100 : 40;
    }
    return 0;
}

function startAuction(position) {
    let space = boardSpaces[position];
    let currentBid = 10;
    let highestBidder = null;
    let activeBidders = players.filter(p => !p.isBankrupt);

    alert(`🔨 INIZIA L'ASTA PER: ${space.name}! (Base: 10 €)`);

    // Semplificazione asta online: se siamo online se la aggiudica chi ha il turno o viene assegnata alla banca per evitare loop bloccanti di prompt concorrenti
    if (isOnline) {
        let offertaMax = prompt(`Asta Online Veloce: Quanti € offri al massimo per ${space.name}? (I tuoi fondi: ${players[myPlayerId].money} €)`);
        let bid = parseInt(offertaMax);
        if (!isNaN(bid) && bid >= 10 && bid <= players[myPlayerId].money) {
            players[myPlayerId].money -= bid;
            space.owner = myPlayerId;
            alert(`🎉 Ti sei aggiudicato la casella ${space.name} per ${bid} €!`);
        } else {
            alert("Offerta non valida o ritirato. La casella resta alla banca.");
        }
        updatePlayersUI(); updateSpaceVisuals(position);
        saveGame();
        return;
    }

    while (activeBidders.length > 1) {
        for (let i = 0; i < activeBidders.length; i++) {
            let bidder = activeBidders[i];
            if (activeBidders.length === 1) break;

            let input = prompt(`Asta: ${space.name}\nOfferta attuale: ${currentBid} € (${highestBidder ? highestBidder.name : 'Nessuno'})\n\n${bidder.name}, offri di più o lascia vuoto per RITIRARTI.`);
            if (!input || input.trim() === "") {
                alert(`${bidder.name} si ritira dall'asta!`);
                activeBidders.splice(i, 1); i--;
            } else {
                let bidAmount = parseInt(input);
                if (!isNaN(bidAmount) && bidAmount > currentBid && bidAmount <= bidder.money) {
                    currentBid = bidAmount; highestBidder = bidder;
                } else {
                    alert("Offerta non valida. Ti sei ritirato.");
                    activeBidders.splice(i, 1); i--;
                }
            }
        }
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

function handleBankruptcy(playerIndex, creditorIndex) {
    let player = players[playerIndex];
    player.isBankrupt = true; player.money = 0;
    
    Object.keys(boardSpaces).forEach(pos => {
        let space = boardSpaces[pos];
        if (space.owner === playerIndex) {
            space.houses = 0;
            if (creditorIndex !== null && creditorIndex !== undefined) {
                space.owner = creditorIndex;
                alert(`🏰 ${space.name} passa a ${players[creditorIndex].name}!`);
            } else {
                space.owner = null; space.mortgaged = false;
                alert(`🏢 ${space.name} torna alla banca!`);
            }
        }
    });
    
    alert(`❌ ${player.name} è in BANCAROTTA!`);
    updateBoardTokens();
    Object.keys(boardSpaces).forEach(pos => updateSpaceVisuals(pos));
    updatePlayersUI();
    saveGame();
}