// 6-gameplay-actions.js

function drawCard() {
    const cardBox = document.getElementById('card-box');
    cardBox.className = "card-display a-sorte"; 
    let player = players[currentPlayerIndex];
    
    // Pesca casualmente una carta dall'unico mazzo "A Sorte"
    const randIdx = Math.floor(Math.random() * carteSorte.length);
    const card = carteSorte[randIdx];
    
    // Mostra la carta nella UI con un colore neutro (es. un viola/porpora per "Sorte")
    cardBox.innerHTML = `<div class="card-type-label" style="color:#8e44ad">🃏 A Sorte</div><div>"${card.text}"</div>`;
    
    // 1. Applica premi in denaro
    if (card.value && card.value > 0) {
        changeMoney(currentPlayerIndex, card.value);
    }
    
    // 2. Applica penalità in denaro
    let cost = card.cost || 0;
    if (cost > 0) {
        if (player.money < cost) {
            if (!isOnline || currentPlayerIndex === myPlayerId) {
                alert(`🚨 DEFAULT imminente! Non hai fondi sufficienti per pagare l'imprevisto.`);
                manageProperties(currentPlayerIndex);
            }
            if (player.money < cost) {
                handleBankruptcy(currentPlayerIndex, null); // Alla banca
            } else {
                changeMoney(currentPlayerIndex, -cost);
            }
        } else {
            changeMoney(currentPlayerIndex, -cost);
        }
    } 
    
    // 3. Applica spostamenti o azioni speciali
    if (card.action === "skip") {
        player.isSkipped = true;
        saveGame();
    } else if (card.action === "jail") {
        sendToJail(currentPlayerIndex);
    } else if (card.action === "jump") {
        setTimeout(() => { jumpToSpace(currentPlayerIndex, card.target, true); }, 1200); 
    }
}

function handleSpaceAction(playerIndex, position) {
    let player = players[playerIndex];
    if (player.isBankrupt) return;
    
    // ORA TUTTE LE CASELLE DELLA SORTE PORTANO ALLA STESSA FUNZIONE
    if ([3, 13, 18, 28, 38].includes(position)) { 
        drawCard(); 
        return; 
    } 
    
    if (position === 20) { sendToJail(playerIndex); return; }           
    
    let space = boardSpaces[position];
    if (space) {
        if (space.owner === null) {
            if (isOnline && playerIndex !== myPlayerId) return;

            if (player.money >= space.price) {
                if (confirm(`${player.name}, vuoi acquistare ${space.name} per ${space.price} €? \n(Se annulli, andrà all'ASTA)`)) {
                    player.money -= space.price;
                    space.owner = playerIndex;
                    alert(`Hai acquistato ${space.name}.`);
                    updatePlayersUI();
                    updateSpaceVisuals(position);
                    saveGame();
                } else {
                    startAuction(position);
                }
            } else {
                alert(`${space.name} costa ${space.price} €, fondi insufficienti. Si va all'ASTA!`);
                startAuction(position);
            }
        } else if (space.owner !== playerIndex) {
            let rentAmount = calculateRent(position);
            if (rentAmount > 0) { 
                let owner = players[space.owner];
                if (player.money < rentAmount) {
                    if (!isOnline || playerIndex === myPlayerId) {
                        alert(`🚨 DEFAULT! ${player.name} non può pagare ${rentAmount} € a ${owner.name}! Gestisci le tue proprietà.`);
                        manageProperties(playerIndex);
                    }
                    if (player.money < rentAmount) {
                        handleBankruptcy(playerIndex, space.owner);
                    } else {
                        player.money -= rentAmount; owner.money += rentAmount;
                        alert(`Casella di ${owner.name}! ${player.name} paga ${rentAmount} €.`);
                        updatePlayersUI();
                        saveGame();
                    }
                } else {
                    player.money -= rentAmount;
                    owner.money += rentAmount;
                    alert(`Casella di ${owner.name}! ${player.name} paga ${rentAmount} €.`);
                    updatePlayersUI();
                    saveGame();
                }
            } else {
                alert(`Casella di ${players[space.owner].name}, ma è IPOTECATA. Non paghi nulla!`);
            }
        } else {
            if (isOnline && playerIndex !== myPlayerId) return;

            if (space.type === "property") {
                if (!ownsColorSet(playerIndex, space.group)) {
                    alert(`Non puoi costruire finché non possiedi tutti i terreni del gruppo ${space.group.toUpperCase()}!`); return;
                }
                if (!canBuildUniformly(space.group, space.houses)) {
                    alert(`Costruzione non uniforme! Pareggia prima gli altri terreni del gruppo.`); return;
                }
                if (space.houses < 5) {
                    let houseLabel = space.houses === 4 ? "un ALBERGO 🏨" : `la casa numero ${space.houses + 1} 🏠`;
                    if (player.money >= space.housePrice) {
                        if (confirm(`Costruire ${houseLabel} su ${space.name} per ${space.housePrice} €?`)) {
                            player.money -= space.housePrice; space.houses++;
                            updatePlayersUI(); updateSpaceVisuals(position);
                            saveGame();
                        }
                    } else alert(`Ti servono ${space.housePrice} € per costruire.`);
                } else alert(`Hai già un Albergo su ${space.name}!`);
            }
        }
    }
}

function sendToJail(playerIndex) {
    let player = players[playerIndex];
    player.position = 30; 
    player.inJail = true;
    player.jailTurns = 0;
    player.consecutiveDoubles = 0;
    alert(`🚨 ${player.name} commette un'infrazione e va dritto in PRIGIONE!`);
    updateBoardTokens();
    updatePlayersUI();
    diceRolled = true;
    document.getElementById('btn-roll').style.display = 'none';
    document.getElementById('btn-next').style.display = 'block';
    saveGame();
}

function changeMoney(playerIndex, amount) {
    players[playerIndex].money += amount;
    updatePlayersUI();
    saveGame();
}