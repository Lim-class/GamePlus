document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LOGICA DI RICERCA GIOCHI (Il tuo codice originale) ---
    const searchBar = document.getElementById('search-bar');
    const games = document.querySelectorAll('.game-item');

    searchBar.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();

        games.forEach(game => {
            // Legge il testo dentro la label del gioco (es. "Tris", "Pong")
            const gameName = game.querySelector('.game-label').textContent.toLowerCase();
            
            if (gameName.includes(searchString)) {
                game.style.display = 'flex'; // Mostra se corrisponde
            } else {
                game.style.display = 'none'; // Nasconde se non corrisponde
            }
        });
    });

    // --- 2. INTEGRAZIONE STATO LOG-IN (Firebase) ---
    const userChip = document.querySelector('.user-chip');
    
    if (window.auth && window.db) {
        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                // L'utente ha effettuato l'accesso
                try {
                    // Recuperiamo il documento usando l'UID dell'utente autenticato
                    const userDoc = await window.db.collection("users").doc(user.uid).get();
                    
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const username = userData.username || "Giocatore";
                        
                        // Sostituisce il testo del pulsante con l'username reale
                        userChip.innerHTML = `<span class="chip-icon">👤</span> ${username}`;
                    }
                } catch (error) {
                    console.error("Errore nel caricamento del profilo utente:", error);
                }

                // Funzionalità di Logout se l'utente clicca sul proprio nome
                userChip.href = "#";
                userChip.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm("Vuoi effettuare il logout da GamePlus?")) {
                        window.auth.signOut().then(() => {
                            localStorage.clear();
                            window.location.reload();
                        });
                    }
                });

            } else {
                // L'utente non è connesso (Mostra Login e punta alla sottocartella)
                userChip.innerHTML = `<span class="chip-icon">👤</span> Login`;
                userChip.href = "login/login.html"; 
            }
        });
    }
});