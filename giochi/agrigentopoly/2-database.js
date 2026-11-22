// 2-database.js
const boardSpaces = {
    // LATO SINISTRO (Scendendo dal VIA verso il Parcheggio)
    1: { name: "Porta di Ponte", price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100, type: "property", group: "rosso", owner: null, houses: 0, mortgaged: false },
    2: { name: "Via Atenea", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, type: "property", group: "rosso", owner: null, houses: 0, mortgaged: false },
    4: { name: "Fiumenaro", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, type: "property", group: "rosso", owner: null, houses: 0, mortgaged: false },
    5: { name: "Stazione Centrale", price: 200, rent: [25, 50, 100, 200], type: "transport", group: "stazioni", owner: null, mortgaged: false },
    6: { name: "Spinasanta", price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100, type: "property", group: "arancione", owner: null, houses: 0, mortgaged: false },
    7: { name: "La Loggia", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, type: "property", group: "arancione", owner: null, houses: 0, mortgaged: false },
    8: { name: "ENOL Luce", price: 150, type: "utility", group: "utenze", owner: null, mortgaged: false },
    9: { name: "Fontanelle", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, type: "property", group: "arancione", owner: null, houses: 0, mortgaged: false },

    // LATO INFERIORE (Da sinistra verso destra, dal Parcheggio a Vai In Prigione)
    11: { name: "Villaggio Peruzzo", price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50, type: "property", group: "azzurro", owner: null, houses: 0, mortgaged: false },
    12: { name: "San Leone", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, type: "property", group: "azzurro", owner: null, houses: 0, mortgaged: false },
    14: { name: "Maddalusa", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, type: "property", group: "azzurro", owner: null, houses: 0, mortgaged: false },
    15: { name: "BuSSAIA", price: 200, rent: [25, 50, 100, 200], type: "transport", group: "stazioni", owner: null, mortgaged: false },
    16: { name: "Pietro Grifo", price: 150, rent: [25, 50], type: "special", owner: null, mortgaged: false },
    17: { name: "Monserrato", price: 60, rent: [4, 20, 60, 180, 320, 450], housePrice: 50, type: "property", group: "marrone", owner: null, houses: 0, mortgaged: false },
    19: { name: "Villaseta", price: 60, rent: [2, 10, 30, 90, 160, 250], housePrice: 50, type: "property", group: "marrone", owner: null, houses: 0, mortgaged: false },

    // LATO DESTRO (Salendo da Vai In Prigione verso la Prigione/Transito)
    21: { name: "Rupe Atenea", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], housePrice: 200, type: "property", group: "viola", owner: null, houses: 0, mortgaged: false },
    22: { name: "Kolymbethra", price: 150, rent: [25, 50], type: "special", owner: null, mortgaged: false },
    23: { name: "Viale Della Vittoria", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], housePrice: 200, type: "property", group: "viola", owner: null, houses: 0, mortgaged: false },
    24: { name: "Valle Templi", price: 200, rent: [50, 100], type: "special", owner: null, mortgaged: false },
    25: { name: "Rotatoria degli Scrittori", price: 200, rent: [25, 50, 100, 200], type: "transport", group: "stazioni", owner: null, mortgaged: false },
    26: { name: "Zingarello", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], housePrice: 200, type: "property", group: "verde", owner: null, houses: 0, mortgaged: false },
    27: { name: "Cannatello", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, type: "property", group: "verde", owner: null, houses: 0, mortgaged: false },
    29: { name: "Villaggio Mosè", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, type: "property", group: "verde", owner: null, houses: 0, mortgaged: false },

    // LATO SUPERIORE (Da destra verso sinistra, dalla Prigione tornando al VIA)
    31: { name: "Contrada Caos", price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150, type: "property", group: "giallo", owner: null, houses: 0, mortgaged: false },
    32: { name: "A.I.C.O.", price: 150, type: "utility", group: "utenze", owner: null, mortgaged: false },
    33: { name: "Giardina Gallotti", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, type: "property", group: "giallo", owner: null, houses: 0, mortgaged: false },
    34: { name: "Montaperto", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, type: "property", group: "giallo", owner: null, houses: 0, mortgaged: false },
    35: { name: "Ponte Morandi", price: 200, rent: [25, 50, 100, 200], type: "transport", group: "stazioni", owner: null, mortgaged: false },
    36: { name: "Duomo (Colle di Girgenti)", price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 150, type: "property", group: "rosa", owner: null, houses: 0, mortgaged: false },
    37: { name: "San Michele", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150, type: "property", group: "rosa", owner: null, houses: 0, mortgaged: false },
    39: { name: "Rabato", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150, type: "property", group: "rosa", owner: null, houses: 0, mortgaged: false }
};