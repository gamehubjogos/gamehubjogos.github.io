class Player {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.width = 40;
        this.height = 40;
        this.speed = 200; // pixels per second
        this.isHiding = false;
        this.inventory = [];
        this.maxInventorySize = 5;
        
        // Field of view
        this.fov = Math.PI / 2; // 90 degrees
        this.viewDistance = 300;
        this.direction = 0; // radians, 0 = right, PI/2 = down
        
        // Movement state
        this.movingUp = false;
        this.movingDown = false;
        this.movingLeft = false;
        this.movingRight = false;
        
        // Stamina
        this.stamina = 100;
        this.maxStamina = 100;
        this.staminaRegenRate = 10; // per second
        this.staminaDepletionRate = 20; // per second when running
        this.isRunning = false;
        this.runningSpeedMultiplier = 1.6;
    }
    
    update(deltaTime) {
        if (this.isHiding) return;
        
        let moveX = 0;
        let moveY = 0;
        
        if (this.game.controls.isKeyDown('w')) {
            moveY -= 1;
            this.movingUp = true;
        } else {
            this.movingUp = false;
        }
        
        if (this.game.controls.isKeyDown('s')) {
            moveY += 1;
            this.movingDown = true;
        } else {
            this.movingDown = false;
        }
        
        if (this.game.controls.isKeyDown('a')) {
            moveX -= 1;
            this.movingLeft = true;
        } else {
            this.movingLeft = false;
        }
        
        if (this.game.controls.isKeyDown('d')) {
            moveX += 1;
            this.movingRight = true;
        } else {
            this.movingRight = false;
        }
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.7071; // 1/sqrt(2)
            moveY *= 0.7071;
        }
        
        // Update direction based on movement
        if (moveX !== 0 || moveY !== 0) {
            this.direction = Math.atan2(moveY, moveX);
        }
        
        // Running logic
        this.isRunning = this.game.controls.isKeyDown('shift') && this.stamina > 0;
        let currentSpeed = this.speed;
        
        if (this.isRunning && (moveX !== 0 || moveY !== 0)) {
            currentSpeed *= this.runningSpeedMultiplier;
            this.stamina = Math.max(0, this.stamina - this.staminaDepletionRate * deltaTime);
        } else {
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * deltaTime);
        }
        
        // Apply movement
        const nextX = this.x + moveX * currentSpeed * deltaTime;
        const nextY = this.y + moveY * currentSpeed * deltaTime;
        
        // Check collision with walls
        if (!this.game.levelManager.checkWallCollision(nextX, this.y, this.width, this.height)) {
            this.x = nextX;
        }
        
        if (!this.game.levelManager.checkWallCollision(this.x, nextY, this.width, this.height)) {
            this.y = nextY;
        }
        
        // Mouse look
        if (this.game.controls.mouseX !== null && this.game.controls.mouseY !== null) {
            const dx = this.game.controls.mouseX - this.x;
            const dy = this.game.controls.mouseY - this.y;
            this.direction = Math.atan2(dy, dx);
        }
    }
    
    render(ctx) {
        if (this.isHiding) return;
        
        // Draw player
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction);
        
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Show direction indicator
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, -2, 20, 4);
        
        ctx.restore();
        
        // Draw field of view (optional, for debugging)
        if (this.game.debugMode) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.direction - this.fov / 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, this.viewDistance, 0, this.fov);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        
        // Draw stamina bar
        const staminaWidth = 100;
        const staminaHeight = 10;
        const staminaX = this.x - staminaWidth / 2;
        const staminaY = this.y + 30;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(staminaX, staminaY, staminaWidth, staminaHeight);
        
        ctx.fillStyle = this.isRunning ? '#f39c12' : '#2ecc71';
        const fillWidth = (this.stamina / this.maxStamina) * staminaWidth;
        ctx.fillRect(staminaX, staminaY, fillWidth, staminaHeight);
    }
    
    collidesWith(entity) {
        if (this.isHiding) return false;
        
        return (
            this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y
        );
    }
    
    resetPosition(position = null) {
        if (position) {
            this.x = position.x;
            this.y = position.y;
        } else {
            // Default position if none provided
            this.x = 100;
            this.y = 100;
        }
    }
    
    hide() {
        this.isHiding = true;
    }
    
    unhide() {
        this.isHiding = false;
    }
    
    addToInventory(item) {
        if (this.inventory.length < this.maxInventorySize) {
            this.inventory.push(item);
            return true;
        }
        return false;
    }
    
    hasItem(itemType) {
        return this.inventory.some(item => item.type === itemType);
    }
    
    removeItem(itemType) {
        const index = this.inventory.findIndex(item => item.type === itemType);
        if (index !== -1) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    }
}