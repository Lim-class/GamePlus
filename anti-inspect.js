// anti-inspect.js
(function() {
    // 1. Disabilita il menu contestuale (tasto destro del mouse)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 2. Disabilita le scorciatoie da tastiera per DevTools, Sorgente Pagina e Salvataggio
    document.addEventListener('keydown', function(e) {
        const key = e.key.toUpperCase();

        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }

        // CTRL + SHIFT + I / J / C (Windows/Linux) o CMD + OPTION + I / J / C (Mac)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(key)) {
            e.preventDefault();
            return false;
        }

        // CTRL + U (Visualizza sorgente) o CTRL + S (Salva pagina)
        if ((e.ctrlKey || e.metaKey) && ['U', 'S'].includes(key)) {
            e.preventDefault();
            return false;
        }
    });

    // 3. Blocca il trascinamento di immagini e testi per evitare copie rapide
    document.addEventListener('dragstart', function(e) {
        if (e.target.nodeName === 'IMG') {
            e.preventDefault();
        }
    });
})();