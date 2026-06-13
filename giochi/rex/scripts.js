// Elementi DOM Area di Gioco
const dino = document.getElementById("dino");
const screen = document.getElementById("screen");
const scoreDisplay = document.getElementById("current-score");
const highScoreDisplay = document.getElementById("high-score");
const startMessage = document.getElementById("start-message");
const pauseMessage = document.getElementById("pause-message");
const gameOverPopup = document.getElementById("game-over-popup");
const finalScoreText = document.getElementById("final-score-text");

// Elementi di controllo Universali (Pulsanti)
const btnJump = document.getElementById("btn-jump");
const btnDuck = document.getElementById("btn-duck");
const btnPause = document.getElementById("btn-pause");

// Configurazione logica originale
const NIGHT_MODE_TRIGGER = 700; // Inversione colori ogni 700 punti

// Stato del gioco
let gameStarted = false;
let isPaused = false;
let isJumping = false;
let isDucking = false;
let score = 0;
let highScore = localStorage.getItem("dinoHighScore") || 0;
let currentSpeed = 1.0; 

let enemies = [];
let dinoRunInterval;
let enemySpawnTimeout;
let gameAnimationFrame;
let scoreInterval;
let spriteCount = 0;

const dinoRunSprites = ["trex1.png", "trex2.png", "trex3.png"];

// Setup iniziale score
highScoreDisplay.innerText = formatScore(highScore);
scoreDisplay.innerText = formatScore(0);

function formatScore(num) {
    return String(Math.floor(num)).padStart(5, '0');
}

function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    isPaused = false;
    score = 0;
    currentSpeed = 1.0;
    
    scoreDisplay.innerText = formatScore(0);
    document.body.classList.remove("dark-mode");
    
    // Svuota nemici precedenti
    enemies.forEach(e => e.remove());
    enemies = [];
    
    // Gestione UI visiva
    startMessage.style.display = "none";
    gameOverPopup.style.display = "none";
    pauseMessage.style.display = "none";

    // Ciclo animazione corsa del Dino
    dinoRunInterval = setInterval(() => {
        if (isPaused) return;
        spriteCount = (spriteCount + 1) % dinoRunSprites.length;
        if (!isJumping && !isDucking) {
            dino.src = dinoRunSprites[spriteCount];
        }
    }, 100);

    // Ciclo gestione punteggio e cambi di stato (Giorno/Notte)
    scoreInterval = setInterval(() => {
        if (isPaused) return;
        
        score++;
        scoreDisplay.innerText = formatScore(score);
        
        // Logica inversione colori originale Chrome (attiva per 100 punti a intervalli di 700)
        const currentCycle = Math.floor(score / NIGHT_MODE_TRIGGER);
        if (currentCycle % 2 !== 0 && score % NIGHT_MODE_TRIGGER < 100) {
            document.body.classList.add("dark-mode");
        } else if (currentCycle % 2 === 0 && score % NIGHT_MODE_TRIGGER < 100) {
            document.body.classList.remove("dark-mode");
        }

        // Aumento progressivo della velocità di gioco ogni 100 punti
        if (score % 100 === 0) {
            currentSpeed += 0.08;
        }
    }, 100);

    scheduleNextSpawn();
    gameAnimationFrame = requestAnimationFrame(gameLoop);
}

function scheduleNextSpawn() {
    if (!gameStarted) return;

    const minTime = 800 / currentSpeed;
    const maxTime = 1800 / currentSpeed;
    const randomizedTime = Math.random() * (maxTime - minTime) + minTime;

    enemySpawnTimeout = setTimeout(() => {
        if (!isPaused) {
            spawnEnemy();
        }
        scheduleNextSpawn();
    }, randomizedTime);
}

function spawnEnemy() {
    if (!gameStarted || isPaused) return;
    
    const enemyContainer = document.createElement("div");
    enemyContainer.classList.add("enemy-instance");
    
    // Condizione originale: gli uccelli compaiono solo dopo i 350 punti
    const spawnBird = score > 350 && Math.random() > 0.65;
    
    if (spawnBird) {
        enemyContainer.classList.add("bird-enemy");
        const birdHeights = ["30px", "65px", "95px"];
        enemyContainer.style.bottom = birdHeights[Math.floor(Math.random() * birdHeights.length)];
    } else {
        const cactusImg = document.createElement("img");
        cactusImg.src = "Cactus.png";
        cactusImg.classList.add("cactus-enemy");
        cactusImg.style.height = Math.random() > 0.5 ? "48px" : "36px";
        enemyContainer.appendChild(cactusImg);
        enemyContainer.style.bottom = "20px";
    }
    
    enemyContainer.style.left = "105%";
    screen.appendChild(enemyContainer);
    enemies.push(enemyContainer);
}

function togglePause() {
    if (!gameStarted) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        pauseMessage.style.display = "block";
        enemies.forEach(e => { if(e.classList.contains('bird-enemy')) e.style.animationPlayState = 'paused'; });
    } else {
        pauseMessage.style.display = "none";
        enemies.forEach(e => { if(e.classList.contains('bird-enemy')) e.style.animationPlayState = 'running'; });
        gameAnimationFrame = requestAnimationFrame(gameLoop);
    }
}

function gameLoop() {
    if (!gameStarted || isPaused) return;

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        let currentLeft = parseFloat(enemy.style.left);
        
        enemy.style.left = (currentLeft - (0.75 * currentSpeed)) + "%";

        if (currentLeft < -10) {
            enemy.remove();
            enemies.splice(i, 1);
            i--;
        }
    }

    if (checkCollision()) {
        endGame();
        return;
    }

    gameAnimationFrame = requestAnimationFrame(gameLoop);
}

function checkCollision() {
    const dinoRect = dino.getBoundingClientRect();
    const paddingX = 14; 
    const paddingY = 8;
    
    for (let enemy of enemies) {
        const enemyRect = enemy.getBoundingClientRect();
        
        if (!(
            dinoRect.right - paddingX < enemyRect.left + paddingX ||
            dinoRect.left + paddingX > enemyRect.right - paddingX ||
            dinoRect.bottom - paddingY < enemyRect.top + paddingY ||
            dinoRect.top + paddingY > enemyRect.bottom - paddingY
        )) {
            return true;
        }
    }
    return false;
}

function endGame() {
    gameStarted = false;
    clearInterval(dinoRunInterval);
    clearInterval(scoreInterval);
    clearTimeout(enemySpawnTimeout);
    cancelAnimationFrame(gameAnimationFrame);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("dinoHighScore", highScore);
        highScoreDisplay.innerText = formatScore(highScore);
    }

    finalScoreText.innerText = "Punteggio finale: " + formatScore(score);
    gameOverPopup.style.display = "block";
}

function triggerJump() {
    if (isPaused) return;
    if (!gameStarted) {
        startGame();
    } else if (!isJumping && !isDucking) {
        isJumping = true;
        dino.classList.add("jump");
        
        setTimeout(() => {
            dino.classList.remove("jump");
            isJumping = false;
        }, 650);
    }
}

// --- GESTIONE INPUT 1: TASTIERA (PC DEKTOP) ---
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
        togglePause();
        return;
    }

    if (isPaused) return;

    if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        triggerJump();
    }
    
    if (e.key === 'ArrowDown' && gameStarted && !isJumping) {
        e.preventDefault();
        isDucking = true;
        dino.classList.add("dino-duck");
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') {
        isDucking = false;
        dino.classList.remove("dino-duck");
    }
});

// --- GESTIONE INPUT 2: PULSANTI SCHERMO (POINTER EVENTS - UNIVERSIBILE PC/MOBILE) ---

// Pulsante Salta
btnJump.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    triggerJump();
});

// Pulsante Abbassati (Inizio azione)
btnDuck.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!gameStarted || isPaused || isJumping) return;
    isDucking = true;
    dino.classList.add("dino-duck");
});

// Pulsante Abbassati (Fine azione al rilascio o se esce dal tasto)
const stopDucking = (e) => {
    e.preventDefault();
    if (isDucking) {
        isDucking = false;
        dino.classList.remove("dino-duck");
    }
};
btnDuck.addEventListener('pointerup', stopDucking);
btnDuck.addEventListener('pointerleave', stopDucking);

// Pulsante Pausa
btnPause.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    togglePause();
});

// Interazione con le Schermate di Messaggio/Popup (Inizio/Riavvio gioco)
startMessage.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startGame();
});

gameOverPopup.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startGame();
});
