const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const playerSprite = document.getElementById("player-sprite");
const ellySprite = document.getElementById("elly-sprite");
const gameContainer = document.getElementById("game-container");
const startScreen = document.getElementById("start-screen");
const endScreen = document.getElementById("end-screen");
const finalContent = document.querySelector(".final-content");

canvas.width = window.innerWidth;
canvas.height = 300;

let gameRunning = false;
let startTime;
let dogs = [];
let bgX = 0;
let gravity = 0.7;
let jumpForce = -16;
let groundY = 190; 

let character = { x: 50, y: groundY, width: 60, height: 60, vy: 0, jumping: false };

const dogImg = new Image(); dogImg.src = "/.assets/pibble.png";
const bgImg = new Image(); bgImg.src = "/.assets/backgroundd.jpeg";

// BOTÃO JOGAR
document.getElementById("start-btn").addEventListener("click", () => {
    // Se o jogo já estiver rodando, ignora o clique (evita acelerar)
    if (gameRunning) return; 

    // Música
    const music = document.getElementById("bg-music");
    if (music) {
        music.play().catch(e => console.log("Erro ao tocar música"));
    }

    // Visual
    startScreen.style.display = "none";
    gameContainer.style.display = "block";
    playerSprite.src = "/.assets/pngcorrendo.gif";
    
    // Estado do Jogo (Reset para garantir velocidade normal)
    gameRunning = true;
    startTime = Date.now();
    dogs = []; 
    bgX = 0;

    // Inicia o loop apenas UMA VEZ
    update();
}, { once: true });

// BOTÃO REINICIAR
document.getElementById("retry-btn").addEventListener("click", () => { location.reload(); });

function jump() {
    if (gameRunning && !character.jumping) {
        character.vy = jumpForce;
        character.jumping = true;
    }
}

window.addEventListener("keydown", (e) => { if(e.code === "Space") jump(); });
window.addEventListener("touchstart", (e) => { if(gameRunning) { e.preventDefault(); jump(); }}, {passive: false});

function spawnDog() { if (gameRunning) dogs.push({ x: canvas.width, y: groundY + 15, width: 45, height: 45 }); }
setInterval(spawnDog, 1500);

function update() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bgX -= 3;
    if (bgX <= -canvas.width) bgX = 0;
    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    character.vy += gravity;
    character.y += character.vy;
    if (character.y >= groundY) { character.y = groundY; character.vy = 0; character.jumping = false; }

    playerSprite.style.left = character.x + "px";
    playerSprite.style.top = character.y + "px";
    playerSprite.style.width = "65px";

    for (let i = dogs.length - 1; i >= 0; i--) {
        let dog = dogs[i];
        dog.x -= 7;
        ctx.drawImage(dogImg, dog.x, dog.y, dog.width, dog.height);
        if (character.x < dog.x + 30 && character.x + 30 > dog.x && character.y < dog.y + 30 && character.y + 30 > dog.y) {
            gameRunning = false;
            playerSprite.src = "/.assets/gameover.png";
            setTimeout(() => { alert("Você se distraiu com um pibble! 🐶😭"); location.reload(); }, 100);
            return;
        }
        if (dog.x < -50) dogs.splice(i, 1);
    }

    if ((Date.now() - startTime) / 1000 >= 30) { startVictoryScene(); return; }
    requestAnimationFrame(update);
}

function startVictoryScene() {
    gameRunning = false;
    dogs = [];
    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    ellySprite.style.display = "block";
    ellySprite.style.top = (groundY - 15) + "px";
    let ellyFinalX = canvas.width - 150;
    ellySprite.style.left = ellyFinalX + "px";

    let walk = setInterval(() => {
        if (character.x < ellyFinalX - 50) {
            character.x += 10;
            playerSprite.style.left = character.x + "px";
            playerSprite.style.top = groundY + "px";
        } else {
            clearInterval(walk);
            playerSprite.src = "/.assets/parada.png";
            playerSprite.style.width = "40px";
            playerSprite.style.height = "75px";
            playerSprite.style.top = (groundY - 10) + "px";

            setTimeout(() => {
                ellySprite.src = "/.assets/kiss.png";
                ellySprite.style.width = "85px";
                ellySprite.style.top = (groundY - 34) + "px";
                ellySprite.style.left = (character.x + 15) + "px";
                playerSprite.style.display = "none";

                setTimeout(() => {
                    endScreen.style.display = "flex";
                    setTimeout(() => { document.getElementById("iris-effect").classList.add("iris-active"); }, 50);
                    setTimeout(() => { 
                        finalContent.style.display = "flex"; 
                        setTimeout(() => { finalContent.classList.add("show-content"); }, 100);
                    }, 1500);
                }, 3000);
            }, 2000);
        }
    }, 16);
}
