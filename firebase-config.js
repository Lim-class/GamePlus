// firebase-config.js

(function() {
    // 1. Configurazione Firebase (ora protetta all'interno di questa funzione)
    const firebaseConfig = {
        apiKey: "AIzaSyAx_wHQ_K_B0lUSLUQLNupdX8krn0iiHtA",
        authDomain: "spottio-1419e.firebaseapp.com",
        projectId: "spottio-1419e",
        storageBucket: "spottio-1419e.firebasestorage.app"
    };

    // 2. Inizializza Firebase UNA SOLA VOLTA
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // 3. Esponi le istanze globali che usiamo nella piattaforma
    window.db = firebase.firestore();
    window.storage = firebase.storage();
    window.auth = firebase.auth();
})();