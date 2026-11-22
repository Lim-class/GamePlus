// 5-movement.js
function rollDice() {
    if (diceRolled) return;
    
    let player = players[currentPlayerIndex];
    if (player.isBankrupt) return;

    // Controllo turni online incrociato
    if (isOnline && currentPlayerIndex !== myPlayerId) {
        alert("Non è il tuo turno!");
        return;
    }

    if (player.inJail) {
        if (confirm(`${player.name}, sei in Prigione! Vuoi pagare 50 € per uscire subito ed effettuare il lancio?`)) {
            if (player.money >= 50) {
                changeMoney(currentPlayerIndex, -50);
                player.inJail = false;
                player.jailTurns = 0;
                alert("Sei uscito di prigione pagando la cauzione!");
                updatePlayersUI();
                saveGame();
            } else {
                alert("Non hai abbastanza soldi! Devi tentare di fare un doppio.");
            }
        }
    }

    diceRolled = true; 

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const totale = d1 + d2;
    const isDouble = (d1 === d2);

    const dice1El = document.getElementById('dice1');
    const dice2El = document.getElementById('dice2');
    
    dice1El.style.transform = 'rotate(360deg)';
    dice2El.style.transform = 'rotate(-360deg)';
    
    setTimeout(() => {
        dice1El.textContent = d1;
        dice2El.textContent = d2;
        dice1El.style.transform = 'none';
        dice2El.style.transform = 'none';
        
        document.getElementById('dice-result').textContent = `Hai fatto ${totale}!`;
        
        if (player.inJail) {
            if (isDouble) {
                document.getElementById('dice-result').textContent += ' 🔓 Doppio! Sei Libero!';
                player.inJail = false;
                player.jailTurns = 0;
                player.consecutiveDoubles = 0;
                moveCurrentPlayer(totale);
                document.getElementById('btn-roll').style.display = 'none';
                document.getElementById('btn-next').style.display = 'block';
            } else {
                player.jailTurns++;
                document.getElementById('dice-result').textContent += ' 🔒 Niente doppio. Resti dentro.';
                if (player.jailTurns >= 3) {
                    alert("Sei rimasto dentro per 3 turni. Paghi 50 € di multa forzata ed esci.");
                    if (player.money < 50) {
                        handleBankruptcy(currentPlayerIndex, null);
                    } else {
                        changeMoney(currentPlayerIndex, -50);
                        player.inJail = false;
                        player.jailTurns = 0;
                        moveCurrentPlayer(totale);
                    }
                }
                document.getElementById('btn-roll').style.display = 'none';
                document.getElementById('btn-next').style.display = 'block';
            }
        } else {
            if (isDouble) {
                player.consecutiveDoubles++;
                if (player.consecutiveDoubles === 3) {
                    document.getElementById('dice-result').textContent += ' 🚨 3 Doppi! Eccesso di velocità!';
                    player.consecutiveDoubles = 0;
                    sendToJail(currentPlayerIndex);
                    return;
                }
            } else {
                player.consecutiveDoubles = 0;
            }

            moveCurrentPlayer(totale);
            document.getElementById('btn-roll').style.display = 'none';
            document.getElementById('btn-next').style.display = 'block';

            if(isDouble && !player.isBankrupt && !player.inJail) {
                document.getElementById('dice-result').textContent += ' 🏆 Doppi! Tira di nuovo!';
                diceRolled = false; 
                document.getElementById('btn-roll').style.display = 'block';
                document.getElementById('btn-next').style.display = 'none';
            }
        }
        saveGame();
    }, 200);
}

function moveCurrentPlayer(steps) {
    let player = players[currentPlayerIndex];
    let oldPos = player.position;
    let newPos = oldPos + steps;

    if (newPos >= 40) {
        newPos = newPos % 40;
        changeMoney(currentPlayerIndex, 200); 
        alert(`${player.name} è passato dal VIA! Incassa 200 €.`);
    }

    player.position = newPos;
    updateBoardTokens();
    saveGame();
    
    setTimeout(() => {
        handleSpaceAction(currentPlayerIndex, newPos);
    }, 300);
}

function jumpToSpace(playerIndex, targetSpace, checkVia) {
    let player = players[playerIndex];
    if (checkVia && targetSpace < player.position) {
        changeMoney(playerIndex, 200);
        alert(`${player.name} passa dal VIA! Incassa 200 €.`);
    }
    player.position = targetSpace;
    updateBoardTokens();
    saveGame();
    setTimeout(() => {
        handleSpaceAction(playerIndex, targetSpace);
    }, 300);
}

function endTurn() {
    diceRolled = false;
    let activePlayers = players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1) {
        alert(`🏆 HA VINTO ${activePlayers[0].name}!!! È il padrone assoluto di Agrigento!`);
        document.getElementById('btn-roll').disabled = true;
        document.getElementById('btn-next').disabled = true;
        saveGame();
        return;
    }

    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    } while (players[currentPlayerIndex].isBankrupt);
    
    players[currentPlayerIndex].consecutiveDoubles = 0; 
    
    document.getElementById('dice-result').textContent = '';
    document.getElementById('btn-roll').style.display = 'block';
    document.getElementById('btn-next').style.display = 'none';
    
    updatePlayersUI();
    saveGame();
    
    if (players[currentPlayerIndex].isSkipped) {
        players[currentPlayerIndex].isSkipped = false;
        alert(`🚦 Il turno di ${players[currentPlayerIndex].name} viene saltato! È bloccato alla rotonda.`);
        saveGame();
        endTurn();
    }
}