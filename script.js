document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    const games = document.querySelectorAll('.game-item');

    searchBar.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();

        games.forEach(game => {
            // Legge il testo dentro la label del gioco (es. "Tris", "Foots")
            const gameName = game.querySelector('.game-label').textContent.toLowerCase();
            
            if (gameName.includes(searchString)) {
                game.style.display = 'flex'; // Mostra se corrisponde
            } else {
                game.style.display = 'none'; // Nasconde se non corrisponde
            }
        });
    });
});