// 3-setup.js
function addPlayer() {
    const nameInput = document.getElementById('playerName');
    const tokenSelect = document.getElementById('playerToken');
    const name = nameInput.value.trim();
    const token = tokenSelect.value;

    if (name === '') { alert("Inserisci un nome!"); return; }
    if (players.length >= 6) { alert("Massimo 6 giocatori!"); return; }
    if (players.some(p => p.token === token)) { alert("Questa pedina è già stata scelta!"); return; }

    players.push({
        id: players.length,
        name: name,
        token: token,
        position: 0,
        money: 1500,
        inJail: false,
        jailTurns: 0,
        isSkipped: false,
        isBankrupt: false,
        consecutiveDoubles: 0
    });

    const list = document.getElementById('players-list-setup');
    const li = document.createElement('li');
    li.textContent = `${token} ${name}`;
    list.appendChild(li);

    nameInput.value = '';
    if (players.length >= 2) {
        document.getElementById('btn-start').disabled = false;
    }
}

function startGame() {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = '';
    updatePlayersUI();
    updateBoardTokens();
}