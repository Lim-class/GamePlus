// firebase-config.js

// 1. Configurazione Firebase
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

// 3. Esponi SOLO le istanze che usiamo per il gioco
window.db = firebase.firestore();
window.storage = firebase.storage();