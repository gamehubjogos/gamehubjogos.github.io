class ItemManager {
    constructor(game) {
        this.game = game;
        this.items = [];
        this.collectedItems = [];
        this.totalItems = 0;
    }
    
    loadItems(itemsData) {
        this.items = [];
        this.collectedItems = [];
        
        itemsData.forEach(data => {
            const item = new Item(
                data.x, 
                data.y, 
                data.type, 
                data.subtype, 
                data.points
            );
            this.items.push(item);
        });
        
        this.totalItems = this.items.length;
    }
    
    update(deltaTime) {
        // Update all items (animation, effects, etc.)
        this.items.forEach(item => {
            item.update(deltaTime);
        });
    }
    
    render(ctx) {
        // Render all items
        this.items.forEach(item => {
            item.render(ctx);
        });
    }
    
    checkPlayerCollision(player) {
        // Check if player collides with any item
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            
            // Simple collision check
            const dx = player.x - item.x;
            const dy = player.y - item.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < player.width / 2 + item.radius) {
                // Collect the item
                this.collectItem(i, player);
            }
        }
    }
    
    collectItem(index, player) {
        const item = this.items[index];
        
        // Add points
        this.game.addScore(item.points);
        
        // Special behavior based on item type
        switch (item.type) {
            case 'key':
                // Add to inventory
                player.addToInventory({
                    type: `key_${item.subtype}`,
                    name: `${item.subtype.charAt(0).toUpperCase() + item.subtype.slice(1)} Key`,
                    description: `Used to unlock the ${item.subtype}`,
                    image: null // In a real game, you'd have item icons
                });
                break;
                
            case 'weapon':
                // Add to inventory
                player.addToInventory({
                    type: `weapon_${item.subtype}`,
                    name: item.subtype.charAt(0).toUpperCase() + item.subtype.slice(1),
                    description: `Can be used to stun Granny`,
                    image: null
                });
                break;
                
            case 'collectible':
                // Just adds points, no inventory
                this.game.showFloatingText(
                    `Found ${item.subtype}!`, 
                    player.x, 
                    player.y - 50, 
                    '#ffff00'
                );
                break;
                
            case 'powerup':
                // Apply effect immediately
                this.applyPowerup(item.subtype, player);
                break;
        }
        
        // Add to collected items
        this.collectedItems.push(item);
        
        // Remove from active items
        this.items.splice(index, 1);
    }
    
    applyPowerup(type, player) {
        switch (type) {
            case 'speed':
                // Temporary speed boost
                const originalSpeed = player.speed;
                player.speed *= 1.5;
                
                // Create visual indicator
                this.game.showFloatingText(
                    'Speed Boost!', 
                    player.x, 
                    player.y - 50, 
                    '#00ffff'
                );
                
                // Reset after duration
                setTimeout(() => {
                    player.speed = originalSpeed;
                    this.game.showFloatingText(
                        'Speed normal', 
                        player.x, 
                        player.y - 50, 
                        '#ffffff'
                    );
                }, 10000); // 10 seconds
                break;
                
            case 'invisibility':
                // Temporary invisibility to Granny
                player.isInvisible = true;
                
                // Create visual indicator
                this.game.showFloatingText(
                    'Invisibility!', 
                    player.x, 
                    player.y - 50, 
                    '#00ffff'
                );
                
                // Reset after duration
                setTimeout(() => {
                    player.isInvisible = false;
                    this.game.showFloatingText(
                        'Visible again', 
                        player.x, 
                        player.y - 50, 
                        '#ffffff'
                    );
                }, 5000); // 5 seconds
                break;
                
            case 'stamina':
                // Refill stamina
                player.stamina = player.maxStamina;
                this.game.showFloatingText(
                    'Stamina Restored!', 
                    player.x, 
                    player.y - 50, 
                    '#00ff00'
                );
                break;
        }
    }
}

class Item {
    constructor(x, y, type, subtype, points) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.subtype = subtype;
        this.points = points;
        this.radius = 15;
        
        // Animation
        this.bounceHeight = 5;
        this.bounceSpeed = 2;
        this.angle = Math.random() * Math.PI * 2;
        this.glowIntensity = 0;
        this.glowDirection = 1;
    }
    
    update(deltaTime) {
        // Floating animation
        this.angle += this.bounceSpeed * deltaTime;
        
        // Glow effect
        this.glowIntensity += this.glowDirection * deltaTime;
        if (this.glowIntensity > 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity < 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
    }
    
    render(ctx) {
        const y = this.y + Math.sin(this.angle) * this.bounceHeight;
        
        // Draw glow
        const glowRadius = this.radius + 10 * this.glowIntensity;
        const gradient = ctx.createRadialGradient(
            this.x, y, this.radius * 0.7,
            this.x, y, glowRadius
        );
        
        // Set glow color based on item type
        let glowColor;
        switch (this.type) {
            case 'key':
                glowColor = 'rgba(255, 215, 0, 0.7)'; // Gold
                break;
            case 'weapon':
                glowColor = 'rgba(192, 57, 43, 0.7)'; // Red
                break;
            case 'collectible':
                glowColor = 'rgba(155, 89, 182, 0.7)'; // Purple
                break;
            case 'powerup':
                glowColor = 'rgba(52, 152, 219, 0.7)'; // Blue
                break;
            default:
                glowColor = 'rgba(255, 255, 255, 0.7)'; // White
        }
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, glowColor);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw item
        ctx.fillStyle = this.getItemColor();
        ctx.beginPath();
        ctx.arc(this.x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw item icon
        this.drawItemIcon(ctx, this.x, y);
    }
    
    getItemColor() {
        switch (this.type) {
            case 'key':
                return '#f1c40f'; // Gold
            case 'weapon':
                return '#e74c3c'; // Red
            case 'collectible':
                return '#9b59b6'; // Purple
            case 'powerup':
                return '#3498db'; // Blue
            default:
                return '#ecf0f1'; // White
        }
    }
    
    drawItemIcon(ctx, x, y) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Show first letter of subtype
        const letter = this.subtype.charAt(0).toUpperCase();
        ctx.fillText(letter, x, y);
    }
}