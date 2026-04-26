const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game constants
const GRID_SIZE = 20;
let TILE_COUNT;
let canvasSize;

// Game state
let snake = [];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snake-high-score') || 0;
let gameLoop;
let isPaused = true;
let speed = 150;

// Initialize high score display
highScoreEl.textContent = String(highScore).padStart(3, '0');

function initCanvas() {
    const wrapper = canvas.parentElement;
    canvasSize = wrapper.clientWidth;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    TILE_COUNT = Math.floor(canvasSize / GRID_SIZE);
}

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1;
    score = 0;
    speed = 150;
    updateScore();
    createFood();
}

function updateScore() {
    currentScoreEl.textContent = String(score).padStart(3, '0');
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snake-high-score', highScore);
        highScoreEl.textContent = String(highScore).padStart(3, '0');
    }
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    // Ensure food doesn't spawn on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        createFood();
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath(); ctx.moveTo(i * GRID_SIZE, 0); ctx.lineTo(i * GRID_SIZE, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * GRID_SIZE); ctx.lineTo(canvas.width, i * GRID_SIZE); ctx.stroke();
    }

    // Draw Food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff3e6d';
    ctx.fillStyle = '#ff3e6d';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 3,
        0, Math.PI * 2
    );
    ctx.fill();

    // Draw Snake
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ff9d';
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        ctx.fillStyle = isHead ? '#00ff9d' : 'rgba(0, 255, 157, 0.8)';
        
        const padding = 2;
        const size = GRID_SIZE - padding * 2;
        
        // Rounded rectangle for snake body
        drawRoundedRect(
            segment.x * GRID_SIZE + padding,
            segment.y * GRID_SIZE + padding,
            size,
            size,
            isHead ? 8 : 4
        );
    });
    ctx.shadowBlur = 0;
}

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function move() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        return gameOver();
    }

    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        createFood();
        // Slightly increase speed
        if (speed > 60) speed -= 2;
    } else {
        snake.pop();
    }
}

function gameOver() {
    isPaused = true;
    clearInterval(gameLoop);
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function startGame() {
    initGame();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isPaused = false;
    runLoop();
}

function runLoop() {
    clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        if (!isPaused) {
            move();
            draw();
        }
    }, speed);
}

// Controls
function handleInput(e) {
    const key = e.key;
    if (key === 'ArrowUp' && dy !== 1) { dx = 0; dy = -1; }
    if (key === 'ArrowDown' && dy !== -1) { dx = 0; dy = 1; }
    if (key === 'ArrowLeft' && dx !== 1) { dx = -1; dy = 0; }
    if (key === 'ArrowRight' && dx !== -1) { dx = 1; dy = 0; }
}

// Event Listeners
window.addEventListener('keydown', handleInput);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Mobile Controls
document.getElementById('ctrl-up').addEventListener('click', () => { if (dy !== 1) { dx = 0; dy = -1; } });
document.getElementById('ctrl-down').addEventListener('click', () => { if (dy !== -1) { dx = 0; dy = 1; } });
document.getElementById('ctrl-left').addEventListener('click', () => { if (dx !== 1) { dx = -1; dy = 0; } });
document.getElementById('ctrl-right').addEventListener('click', () => { if (dx !== -1) { dx = 1; dy = 0; } });

// Resize handling
window.addEventListener('resize', initCanvas);

// Start
initCanvas();
draw();
