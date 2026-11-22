// firebase-config.js
(function() {
    const firebaseConfig = {
        apiKey: "AIzaSyAx_wHQ_K_B0lUSLUQLNupdX8krn0iiHtA",
        authDomain: "spottio-1419e.firebaseapp.com",
        projectId: "spottio-1419e",
        storageBucket: "spottio-1419e.firebasestorage.app"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Inizializza ogni servizio solo se la relativa libreria è stata importata nell'HTML
    window.db = typeof firebase.firestore === 'function' ? firebase.firestore() : null;
    window.storage = typeof firebase.storage === 'function' ? firebase.storage() : null;
    window.auth = typeof firebase.auth === 'function' ? firebase.auth() : null;
})();