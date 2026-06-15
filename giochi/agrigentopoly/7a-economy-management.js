// 7a-economy-management.js

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
        
        let action = prompt(`Gestione: ${space.name}\n1: Ipoteca / Riscatta Terreno\n2: Vendi 1 Casa/Albergo (+${space.housePrice ? space.housePrice/2 : 0} €)\n3: Metti all'Asta tra i giocatori\n\nDigita 1, 2 o 3:`);
        
        if(action === '1') toggleMortgage(playerIndex, pos);
        else if(action === '2') sellHouse(playerIndex, pos);
        else if(action === '3') startPlayerAuction(playerIndex, pos);
    } else {
        alert("Proprietà non trovata nel tuo portafoglio.");
    }
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