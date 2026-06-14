// 7c-economy-utils.js

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