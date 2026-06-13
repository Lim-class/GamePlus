// 6-gameplay-actions.js
function changeMoney(playerIndex, amount) {
    players[playerIndex].money += amount;
    updatePlayersUI();
    saveGame();
}

function handleSpaceAction(playerIndex, position) {
    let player = players[playerIndex];
    if (player.isBankrupt) return;
    
    if ([3, 18, 28].includes(position)) { drawCard('prob'); return; } 
    if ([13, 38].includes(position)) { drawCard('imprev'); return; }    
    if (position === 20) { sendToJail(playerIndex); return; }           
    
    let space = boardSpaces[position];
    if (space) {
        if (space.owner === null) {
            // Se siamo online, l'azione la prende solo l'effettivo proprietario del turno
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
            // Cliccato sulla propria casella per costruire
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

function drawCard(type) {
    const cardBox = document.getElementById('card-box');
    cardBox.className = "card-display"; 
    let player = players[currentPlayerIndex];
    
    if (type === 'prob') {
        cardBox.classList.add('probabilità');
        const randIdx = Math.floor(Math.random() * carteProbabilità.length);
        
        // FIX: Eliminato il '\' prima di ${carteProbabilità}
        cardBox.innerHTML = `<div class="card-type-label" style="color:#2980b9">❓ Probabilità</div><div>"${carteProbabilità[randIdx]}"</div>`;
        
        // Array aggiornato a 10 valori (gli ultimi 4 sono le nuove carte)
        const rewards = [50, 100, 150, 100, 30, 50, 200, 20, 100, 150];
        changeMoney(currentPlayerIndex, rewards[randIdx]);
        
    } else if (type === 'imprev') {
        cardBox.classList.add('imprevisto');
        const randIdx = Math.floor(Math.random() * carteImprevisti.length);
        
        // FIX: Eliminato il '\' prima di ${carteImprevisti}
        cardBox.innerHTML = `<div class="card-type-label" style="color:#d35400">⚠️ Imprevisto</div><div>"${carteImprevisti[randIdx]}"</div>`;
        
        // Array aggiornato a 10 valori (gli ultimi 4 sono le nuove carte)
        let costs = [50, 80, 0, 30, 0, 0, 100, 50, 0, 150];
        let cost = costs[randIdx];
        
        if (cost > 0) {
            if (player.money < cost) {
                if (!isOnline || currentPlayerIndex === myPlayerId) {
                    alert(`🚨 DEFAULT imminente!`);
                    manageProperties(currentPlayerIndex);
                }
                if (player.money < cost) handleBankruptcy(currentPlayerIndex, null);
                else changeMoney(currentPlayerIndex, -cost);
            } else changeMoney(currentPlayerIndex, -cost);
        } else if (randIdx === 2) {
            player.isSkipped = true;
            saveGame();
        } else if (randIdx === 4) {
            sendToJail(currentPlayerIndex);
        } else if (randIdx === 5) {
            setTimeout(() => { jumpToSpace(currentPlayerIndex, 1, true); }, 1200); 
        } else if (randIdx === 8) {
            // Nuova azione per l'imprevisto indice 8 (Vai al VIA)
            setTimeout(() => { jumpToSpace(currentPlayerIndex, 0, true); }, 1200); 
        }
    }
}