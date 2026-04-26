// Elementi
const dino = document.getElementById("dino");
const screen = document.getElementById("screen");
const scoreDisplay = document.getElementById("current-score");
const highScoreDisplay = document.getElementById("high-score");
const startMessage = document.getElementById("start-message");
const pauseMessage = document.getElementById("pause-message");
const gameOverPopup = document.getElementById("game-over-popup");
const finalScoreText = document.getElementById("final-score-text");

// Stato
let gameStarted = false;
let isPaused = false;
let isJumping = false;
let isDucking = false;
let score = 0;
let highScore = localStorage.getItem("dinoHighScore") || 0;

let enemies = [];
let dinoRunInterval;
let enemySpawnInterval;
let gameAnimationFrame;
let spriteCount = 0;
const dinoRunSprites = ["trex1.png", "trex2.png", "trex3.png"];

// Inizializzazione UI
highScoreDisplay.innerText = highScore;

function startGame() {
    if (gameStarted) return;
    
    // Reset stato e UI
    gameStarted = true;
    isPaused = false;
    score = 0;
    scoreDisplay.innerText = "0";
    enemies.forEach(e => e.remove());
    enemies = [];
    
    // Nascondi tutti i messaggi/popup
    startMessage.style.display = "none";
    gameOverPopup.style.display = "none";
    pauseMessage.style.display = "none";

    // Start cicli
    dinoRunInterval = setInterval(() => {
        spriteCount = (spriteCount + 1) % dinoRunSprites.length;
        if (!isJumping) dino.src = dinoRunSprites[spriteCount];
    }, 100);

    spawnEnemy();
    enemySpawnInterval = setInterval(spawnEnemy, Math.random() * (1500 - 800) + 800);
    gameAnimationFrame = requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (isPaused || !gameStarted) return;

    // Movimento nemici e collisioni
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        let currentLeft = parseFloat(enemy.style.left);
        enemy.style.left = (currentLeft - 1.2) + "%"; // Velocità fissa o incrementale

        if (currentLeft < -10) {
            enemy.remove();
            enemies.splice(i, 1);
            i--;
            score++;
            scoreDisplay.innerText = score;
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
    const tolerance = 10; // Rende la collisione più realistica
    
    for (let enemy of enemies) {
        const enemyRect = enemy.getBoundingClientRect();
        if (!(
            dinoRect.right - tolerance < enemyRect.left + tolerance ||
            dinoRect.left + tolerance > enemyRect.right - tolerance ||
            dinoRect.bottom - tolerance < enemyRect.top + tolerance ||
            dinoRect.top + tolerance > enemyRect.bottom - tolerance
        )) return true;
    }
    return false;
}

function spawnEnemy() {
    if (isPaused) return;
    const enemy = document.createElement("img");
    enemy.classList.add("enemy-instance");
    enemy.src = Math.random() > 0.5 ? "Cactus.png" : "https://placehold.co/50x40/535353/FFF?text=Bird";
    enemy.style.height = "50px";
    enemy.style.bottom = (enemy.src.includes("Bird") ? "80px" : "20px");
    enemy.style.left = "105%";
    screen.appendChild(enemy);
    enemies.push(enemy);
}

function endGame() {
    gameStarted = false;
    clearInterval(dinoRunInterval);
    clearInterval(enemySpawnInterval);
    cancelAnimationFrame(gameAnimationFrame);

    // Gestione Record
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("dinoHighScore", highScore);
        highScoreDisplay.innerText = highScore;
    }

    // Mostra Popup
    finalScoreText.innerText = "Punteggio finale: " + score;
    gameOverPopup.style.display = "block";
}

// Input
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp') {
        if (!gameStarted) startGame();
        else if (!isJumping && !isPaused) {
            isJumping = true;
            dino.classList.add("jump");
            setTimeout(() => {
                dino.classList.remove("jump");
                isJumping = false;
            }, 700);
        }
    }
    if (e.key === 'ArrowDown' && gameStarted && !isJumping) {
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
