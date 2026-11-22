// Elementi DOM Area di Gioco
const dino = document.getElementById("dino");
const screen = document.getElementById("screen");
const scoreDisplay = document.getElementById("current-score");
const highScoreDisplay = document.getElementById("high-score");
const startMessage = document.getElementById("start-message");
const pauseMessage = document.getElementById("pause-message");
const gameOverPopup = document.getElementById("game-over-popup");
const finalScoreText = document.getElementById("final-score-text");

// Pulsanti
const btnJump = document.getElementById("btn-jump");
const btnDuck = document.getElementById("btn-duck");
const btnPause = document.getElementById("btn-pause");

// Configurazione
const NIGHT_MODE_TRIGGER = 700;

// Stato del gioco
let gameStarted = false;
let isPaused = false;
let isJumping = false;
let isDucking = false;
let score = 0;
let highScore = Number(localStorage.getItem("dinoHighScore")) || 0;
let currentSpeed = 1.0; 

let enemies = [];
let dinoRunInterval;
let enemySpawnTimeout;
let jumpTimeout;
let gameAnimationFrame;
let scoreInterval;
let spriteCount = 0;

const dinoRunSprites = ["trex1.png", "trex2.png", "trex3.png"];

highScoreDisplay.innerText = formatScore(highScore);
scoreDisplay.innerText = formatScore(0);

function formatScore(num) {
    return String(Math.floor(num)).padStart(5, '0');
}

function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    isPaused = false;
    isJumping = false;
    isDucking = false;
    score = 0;
    currentSpeed = 1.0;
    
    // Ripristina aspetto iniziale del Dino
    dino.src = "trex1.png";
    dino.classList.remove("jump", "dino-duck", "paused-anim");
    
    scoreDisplay.innerText = formatScore(0);
    document.body.classList.remove("dark-mode");
    
    enemies.forEach(e => e.remove());
    enemies = [];
    
    startMessage.style.display = "none";
    gameOverPopup.style.display = "none";
    pauseMessage.style.display = "none";

    // Animazione corsa
    dinoRunInterval = setInterval(() => {
        if (isPaused) return;
        spriteCount = (spriteCount + 1) % dinoRunSprites.length;
        if (!isJumping && !isDucking) {
            dino.src = dinoRunSprites[spriteCount];
        }
    }, 100);

    // Punteggio e cambio giorno/notte
    scoreInterval = setInterval(() => {
        if (isPaused) return;
        
        score++;
        scoreDisplay.innerText = formatScore(score);
        
        const currentCycle = Math.floor(score / NIGHT_MODE_TRIGGER);
        if (currentCycle % 2 !== 0 && score % NIGHT_MODE_TRIGGER < 100) {
            document.body.classList.add("dark-mode");
        } else if (currentCycle % 2 === 0 && score % NIGHT_MODE_TRIGGER < 100) {
            document.body.classList.remove("dark-mode");
        }

        if (score % 100 === 0) {
            currentSpeed += 0.08;
        }
    }, 100);

    scheduleNextSpawn();
    gameAnimationFrame = requestAnimationFrame(gameLoop);
}

function scheduleNextSpawn() {
    if (!gameStarted || isPaused) return;

    const minTime = 850 / currentSpeed;
    const maxTime = 1850 / currentSpeed;
    const randomizedTime = Math.random() * (maxTime - minTime) + minTime;

    enemySpawnTimeout = setTimeout(() => {
        if (!isPaused && gameStarted) {
            spawnEnemy();
            scheduleNextSpawn();
        }
    }, randomizedTime);
}

function spawnEnemy() {
    if (!gameStarted || isPaused) return;
    
    const enemyContainer = document.createElement("div");
    enemyContainer.classList.add("enemy-instance");
    
    const spawnBird = score > 350 && Math.random() > 0.65;
    
    if (spawnBird) {
        enemyContainer.classList.add("bird-enemy");
        const birdHeights = ["28px", "62px", "95px"];
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
        clearTimeout(enemySpawnTimeout);
        pauseMessage.style.display = "block";
        dino.classList.add("paused-anim");
        enemies.forEach(e => e.classList.add("paused-anim"));
    } else {
        pauseMessage.style.display = "none";
        dino.classList.remove("paused-anim");
        enemies.forEach(e => e.classList.remove("paused-anim"));
        scheduleNextSpawn();
        gameAnimationFrame = requestAnimationFrame(gameLoop);
    }
}

function gameLoop() {
    if (!gameStarted || isPaused) return;

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        let currentLeft = parseFloat(enemy.style.left);
        
        enemy.style.left = (currentLeft - (0.75 * currentSpeed)) + "%";

        if (currentLeft < -15) {
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
    // Margini calibrati per evitare morti ingiuste sugli angoli trasparenti
    const dinoPadX = 12; 
    const dinoPadY = 8;
    
    for (let enemy of enemies) {
        const enemyRect = enemy.getBoundingClientRect();
        const isBird = enemy.classList.contains("bird-enemy");
        const enemyPadX = isBird ? 10 : 8;
        const enemyPadY = isBird ? 8 : 6;
        
        if (!(
            dinoRect.right - dinoPadX < enemyRect.left + enemyPadX ||
            dinoRect.left + dinoPadX > enemyRect.right - enemyPadX ||
            dinoRect.bottom - dinoPadY < enemyRect.top + enemyPadY ||
            dinoRect.top + dinoPadY > enemyRect.bottom - enemyPadY
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
    clearTimeout(jumpTimeout);
    cancelAnimationFrame(gameAnimationFrame);

    // Mostra lo sprite del T-Rex sconfitto e ferma l'animazione
    dino.src = "trexdead.png";
    dino.classList.add("paused-anim");

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
        
        jumpTimeout = setTimeout(() => {
            dino.classList.remove("jump");
            isJumping = false;
        }, 650);
    }
}

// --- INPUT TASTIERA ---
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

// --- INPUT PULSANTI / TOUCH ---
btnJump.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    triggerJump();
});

btnDuck.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!gameStarted || isPaused || isJumping) return;
    isDucking = true;
    dino.classList.add("dino-duck");
});

const stopDucking = (e) => {
    e.preventDefault();
    if (isDucking) {
        isDucking = false;
        dino.classList.remove("dino-duck");
    }
};
btnDuck.addEventListener('pointerup', stopDucking);
btnDuck.addEventListener('pointerleave', stopDucking);

btnPause.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    togglePause();
});

startMessage.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startGame();
});

gameOverPopup.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startGame();
});