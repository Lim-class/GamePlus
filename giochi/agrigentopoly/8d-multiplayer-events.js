// 8d-multiplayer-events.js

let isProcessingTrade = false; 

// Gestisce i popup e i turni dell'asta chiamati dall'onSnapshot
function handleOnlineAuction() {
    if (!auctionData || isProcessingTrade) return;

    // 1. GESTIONE DEI RILANCI E DEI PASSI
    if (auctionData.status === "active") {
        let currentTurnId = auctionData.activeBidders[auctionData.turnIndex];
        
        if (currentTurnId === myPlayerId) {
            isProcessingTrade = true;
            
            setTimeout(() => {
                let propertyName = boardSpaces[auctionData.propertyPos].name;
                let highestBidderName = auctionData.highestBidder !== null ? players[auctionData.highestBidder].name : "Nessuno";
                
                let validAction = false;
                let ritirato = false;
                let passato = false;

                while (!validAction) {
                    let input = prompt(`🔨 ASTA ONLINE: ${propertyName}\\nOfferta attuale: ${auctionData.currentBid} € (${highestBidderName})\\n\\nÈ il tuo turno, ${players[myPlayerId].name}!\\n\\n- Inserisci un'offerta MAGGIORE\\n- Lascia vuoto per PASSARE\\n- Scrivi "ESCI" per abbandonare del tutto`);
                    
                    if (input !== null && input.trim().toUpperCase() === "ESCI") {
                        ritirato = true;
                        validAction = true;
                    } else if (!input || input.trim() === "") {
                        passato = true;
                        validAction = true;
                    } else {
                        let newBid = parseInt(input);
                        if (isNaN(newBid) || newBid <= auctionData.currentBid || newBid > players[myPlayerId].money) {
                            alert("Offerta non valida o fondi insufficienti! Ritenta.");
                        } else {
                            auctionData.currentBid = newBid;
                            auctionData.highestBidder = myPlayerId;
                            auctionData.consecutivePasses = 0; 
                            validAction = true;
                        }
                    }
                }

                if (passato) {
                    alert("Hai passato il turno. Se qualcun altro rilancia potrai ritentare.");
                    auctionData.consecutivePasses++;
                    auctionData.turnIndex = (auctionData.turnIndex + 1) % auctionData.activeBidders.length;
                } else if (ritirato) {
                    alert("Ti sei ritirato definitivamente dall'asta.");
                    auctionData.activeBidders.splice(auctionData.turnIndex, 1);
                    if (auctionData.activeBidders.length > 0) {
                        auctionData.turnIndex = auctionData.turnIndex % auctionData.activeBidders.length;
                    }
                } else {
                    auctionData.turnIndex = (auctionData.turnIndex + 1) % auctionData.activeBidders.length;
                }

                // CONTROLLO FINE ASTA LUNGA
                let endAuction = false;
                if (auctionData.activeBidders.length === 0) endAuction = true;
                else if (auctionData.activeBidders.length === 1 && auctionData.highestBidder !== null) endAuction = true;
                else if (auctionData.highestBidder === null && auctionData.consecutivePasses >= auctionData.activeBidders.length) endAuction = true;
                else if (auctionData.highestBidder !== null && auctionData.consecutivePasses >= auctionData.activeBidders.length - 1) endAuction = true;

                if (endAuction) {
                    let finalWinner = null;
                    if (auctionData.highestBidder !== null && auctionData.activeBidders.includes(auctionData.highestBidder)) {
                        finalWinner = auctionData.highestBidder;
                    } else if (auctionData.activeBidders.length === 1 && auctionData.highestBidder !== null) {
                        finalWinner = auctionData.highestBidder; 
                    }
                    chiudiAstaOnline(finalWinner, auctionData.currentBid);
                } else {
                    syncGameState();
                }
                
                isProcessingTrade = false;
            }, 400);
        }
    } 
    
    // 2. GESTIONE FINE ASTA (Annuncio a tutti)
    else if (auctionData.status === "finished") {
        isProcessingTrade = true;
        let propertyName = boardSpaces[auctionData.propertyPos].name;
        
        if (auctionData.winnerId !== null) {
            let winnerName = players[auctionData.winnerId].name;
            alert(`🎉 ASTA CONCLUSA!\\n${winnerName} si aggiudica ${propertyName} per ${auctionData.finalPrice} €!`);
        } else {
            let text = auctionData.type === "player" ? "al venditore" : "alla Banca";
            alert(`🛑 ASTA CONCLUSA!\\nTutti hanno passato o abbandonato, il terreno resta ${text}.`);
        }
        
        if (myPlayerId === 0) {
            auctionData = null;
            syncGameState();
        } else {
            auctionData = null; 
        }
        
        isProcessingTrade = false;
    }
}

// Helper per chiudere la transazione in modo pulito
function chiudiAstaOnline(winnerId, price) {
    auctionData.status = "finished";
    auctionData.winnerId = winnerId;
    auctionData.finalPrice = price;

    if (winnerId !== null) {
        players[winnerId].money -= price; 
        
        if (auctionData.type === "player" && auctionData.sellerId !== null) {
            players[auctionData.sellerId].money += price;
        }
        
        boardSpaces[auctionData.propertyPos].owner = winnerId; 
    }

    updatePlayersUI();
    updateSpaceVisuals(auctionData.propertyPos);
    syncGameState(); 
}