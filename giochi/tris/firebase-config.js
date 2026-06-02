// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAx_wHQ_K_B0lUSLUQLNupdX8krn0iiHtA",
    authDomain: "spottio-1419e.firebaseapp.com",
    projectId: "spottio-1419e",
    storageBucket: "spottio-1419e.firebasestorage.app",
};

// Inizializza l'applicazione solo se non è già stata creata
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// RENDI DISPONIBILI LE ISTANZE GLOBALMENTE
//window.auth = firebase.auth();
window.db = firebase.firestore();
//window.storage = firebase.storage();