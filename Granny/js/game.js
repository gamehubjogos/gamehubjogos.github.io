// Main Game Controller
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.timer = 0;
        this.gameActive = false;
        this.paused = false;
        
        // Initialize components
        this.assets = new AssetManager();
        this.controls = new Controls(this);
        this.levelManager = new LevelManager(this);
        
        // Load initial assets and setup
        this.init();
    }
    
    async init() {
        // Show loading screen
        this.showScreen('loading');
        
        // Load assets
        await this.assets.loadAll();
        
        // Initialize player and other game objects
        this.player = new Player(this);
        this.granny = new Granny(this);
        this.items = new ItemManager(this);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show menu after loading
        this.showScreen('menu');
    }
    
    startGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.timer = 0;
        
        this.updateHUD();
        this.loadLevel(this.level);
        
        this.hideAllScreens();
        this.gameActive = true;
        
        // Start the game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Start the timer
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }
    
    gameLoop(timestamp) {
        if (!this.gameActive) return;
        
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        if (!this.paused) {
            this.update(deltaTime);
            this.render();
        }
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        this.player.update(deltaTime);
        this.granny.update(deltaTime);
        this.items.update(deltaTime);
        
        // Check collisions
        this.checkCollisions();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render current level
        this.levelManager.render(this.ctx);
        
        // Render items
        this.items.render(this.ctx);
        
        // Render characters
        this.granny.render(this.ctx);
        this.player.render(this.ctx);
    }
    
    checkCollisions() {
        // Check if player collides with granny
        if (this.player.collidesWith(this.granny)) {
            this.playerCaught();
        }
        
        // Check if player collides with items
        this.items.checkPlayerCollision(this.player);
        
        // Check level exit condition
        if (this.levelManager.checkExitReached(this.player)) {
            this.completeLevel();
        }
    }
    
    playerCaught() {
        this.lives--;
        this.updateHUD();
        this.flashScreen();
        
        // Reset player and granny positions
        this.player.resetPosition();
        this.granny.resetPosition();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    addScore(points) {
        this.score += points;
        this.updateHUD();
        
        // Show floating score text
        this.showFloatingText(`+${points}`, this.player.x, this.player.y - 30, '#fff');
    }
    
    completeLevel() {
        // Stop the game loop
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        // Calculate bonuses
        const timeBonus = Math.max(300 - this.timer, 0) * 10;
        const itemsFound = this.items.collectedItems.length;
        const totalItems = this.items.totalItems;
        
        // Add bonuses to score
        this.score += timeBonus;
        
        // Update level complete screen
        document.querySelector('.level-score').textContent = this.score;
        document.querySelector('.time-bonus').textContent = timeBonus;
        document.querySelector('.items-found').textContent = itemsFound;
        document.querySelector('.total-items').textContent = totalItems;
        
        // Show level complete screen
        this.showScreen('level-complete');
    }
    
    nextLevel() {
        this.level++;
        this.timer = 0;
        this.updateHUD();
        
        this.loadLevel(this.level);
        
        this.hideAllScreens();
        this.gameActive = true;
        
        // Restart the timer
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
        
        // Continue the game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameOver() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        // Update game over screen
        document.getElementById('final-score').textContent = this.score;
        
        // Show game over screen
        this.showScreen('game-over');
        
        // Save high score
        this.saveHighScore();
    }
    
    loadLevel(levelNum) {
        this.levelManager.loadLevel(levelNum);
        this.player.resetPosition(this.levelManager.getPlayerStartPosition());
        this.granny.resetPosition(this.levelManager.getGrannyStartPosition());
        this.items.loadItems(this.levelManager.getItems());
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    updateTimer() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    showScreen(screenId) {
        this.hideAllScreens();
        document.getElementById(screenId).classList.add('active');
    }
    
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }
    
    flashScreen() {
        const flash = document.querySelector('.flash');
        flash.style.opacity = 0.8;
        
        setTimeout(() => {
            flash.style.opacity = 0;
        }, 100);
    }
    
    showFloatingText(text, x, y, color) {
        // Create floating text element
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.position = 'absolute';
        floatingText.style.left = `${x}px`;
        floatingText.style.top = `${y}px`;
        floatingText.style.color = color;
        floatingText.style.fontSize = '20px';
        floatingText.style.pointerEvents = 'none';
        floatingText.style.zIndex = '15';
        floatingText.style.transition = 'all 1s ease-out';
        
        document.getElementById('game-container').appendChild(floatingText);
        
        // Animate and remove
        setTimeout(() => {
            floatingText.style.opacity = '0';
            floatingText.style.transform = 'translateY(-30px)';
            
            setTimeout(() => {
                floatingText.remove();
            }, 1000);
        }, 100);
    }
    
    saveHighScore() {
        const highScores = JSON.parse(localStorage.getItem('grannyHighScores') || '[]');
        
        highScores.push({
            score: this.score,
            level: this.level,
            date: new Date().toISOString(),
            name: 'Player' // Could add name input later
        });
        
        // Sort and keep top 10
        highScores.sort((a, b) => b.score - a.score);
        const topScores = highScores.slice(0, 10);
        
        localStorage.setItem('grannyHighScores', JSON.stringify(topScores));
    }
    
    setupEventListeners() {
        // Start button
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });
        
        // Next level button
        document.getElementById('next-level-button').addEventListener('click', () => {
            this.nextLevel();
        });
        
        // Retry button
        document.getElementById('retry-button').addEventListener('click', () => {
            this.startGame();
        });
        
        // Menu button
        document.getElementById('menu-button').addEventListener('click', () => {
            this.showScreen('menu');
        });
        
        // Escape to pause
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameActive) {
                this.paused = !this.paused;
                if (this.paused) {
                    this.showScreen('pause');
                } else {
                    this.hideAllScreens();
                }
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
}

// Initialize the game when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});