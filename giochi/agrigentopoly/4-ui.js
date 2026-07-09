// 4-ui.js
function updatePlayersUI() {
    const container = document.getElementById('active-players-container');
    container.innerHTML = '';
    
    players.forEach((p, index) => {
        const isActive = (index === currentPlayerIndex && !p.isBankrupt) ? 'active-turn' : '';
        const card = document.createElement('div');
        card.className = `player-card ${isActive}`;
        
        if (p.isBankrupt) {
            card.style.opacity = '0.35';
            card.style.textDecoration = 'line-through';
        }
        
        let ownedCount = Object.values(boardSpaces).filter(s => s.owner === index).length;
        
        // Verifica se posso cliccare per gestire la mia proprietà
        const abilitaGestione = !p.isBankrupt && index === currentPlayerIndex && (!isOnline || myPlayerId === index);
        
        card.innerHTML = `
            <div style="font-weight:bold; font-size:1.1rem;">
                ${p.token} <span style="color:#bdc3c7; font-size:0.9rem;">${p.name}</span>
                ${p.isBankrupt ? ' 💀 <span style="color:#e74c3c; font-size:0.8rem; font-weight:bold;">FALLITO</span>' : (p.inJail ? ' 🚨 <span style="color:#e74c3c; font-size:0.8rem; font-weight:bold;">IN PRIGIONE</span>' : '')}
            </div>
            <div style="font-weight:bold; color:#2ecc71;">${p.money} €</div>
            <div style="font-size:0.75rem; color:#bdc3c7; margin-bottom:5px;">Proprietà: ${p.isBankrupt ? 0 : ownedCount}</div>
            ${abilitaGestione ? `<button onclick="manageProperties(${index})" style="background-color:#3498db; padding:3px; font-size:0.75rem;">Gestisci Proprietà</button>` : ''}
        `;
        container.appendChild(card);
    });

    if (players[currentPlayerIndex]) {
        document.getElementById('turn-indicator').textContent = `🎲 Turno di: ${players[currentPlayerIndex].name}`;
    }

    // DISABILITA I PULSANTI SE ONLINE E NON È IL TUO TURNO
    if (isOnline) {
        const isMyTurn = (currentPlayerIndex === myPlayerId);
        document.getElementById('btn-roll').disabled = !isMyTurn;
        document.getElementById('btn-next').disabled = !isMyTurn;
    }
}

function updateBoardTokens() {
    for(let i=0; i<40; i++) {
        let box = document.getElementById(`space-${i}`);
        if(box) {
            let container = box.querySelector('.tokens-container');
            if(container) container.innerHTML = '';
        }
    }
    players.forEach(p => {
        if (p.isBankrupt) return; 
        let box = document.getElementById(`space-${p.position}`);
        if(box) {
            let container = box.querySelector('.tokens-container');
            if(container) {
                let tokenEl = document.createElement('div');
                tokenEl.className = 'token';
                tokenEl.textContent = p.token;
                container.appendChild(tokenEl);
            }
        }
    });
}

function updateSpaceVisuals(position) {
    let box = document.getElementById(`space-${position}`);
    let space = boardSpaces[position];
    if (!box || !space) return;

    let ownerBadge = box.querySelector('.owner-badge');
    let houseBadge = box.querySelector('.house-badge');

    if (space.owner === null) {
        if (ownerBadge) ownerBadge.textContent = '';
        if (houseBadge) houseBadge.textContent = '';
        return;
    }

    if (!ownerBadge) {
        ownerBadge = document.createElement('div');
        ownerBadge.className = 'owner-badge';
        ownerBadge.style.position = 'absolute'; ownerBadge.style.bottom = '2px';
        ownerBadge.style.left = '5px'; ownerBadge.style.fontSize = '0.7rem';
        box.appendChild(ownerBadge);
    }
    ownerBadge.textContent = `👑${players[space.owner].token}`;

    if (!houseBadge) {
        houseBadge = document.createElement('div');
        houseBadge.className = 'house-badge';
        houseBadge.style.position = 'absolute'; houseBadge.style.top = '2px';
        houseBadge.style.right = '5px'; houseBadge.style.fontSize = '0.75rem';
        box.appendChild(houseBadge);
    }

    if (space.mortgaged) {
        houseBadge.textContent = "🔒 IPOTECA";
        houseBadge.style.color = "#e74c3c";
    } else if (space.type === "property") {
        houseBadge.style.color = "#ecf0f1";
        if (space.houses === 5) {
            houseBadge.textContent = "🏨 H";
            houseBadge.style.color = "#f1c40f";
        } else if (space.houses > 0) {
            houseBadge.textContent = "🏠".repeat(space.houses);
        } else {
            houseBadge.textContent = "";
        }
    }
}