class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = null;
        this.levels = [
            // Level 1 - Tutorial
            {
                name: "Granny's Attic",
                walls: [
                    // Outer walls
                    { x: 0, y: 0, width: 1000, height: 20 },
                    { x: 0, y: 0, width: 20, height: 800 },
                    { x: 0, y: 780, width: 1000, height: 20 },
                    { x: 980, y: 0, width: 20, height: 800 },
                    
                    // Inner walls
                    { x: 200, y: 100, width: 20, height: 400 },
                    { x: 400, y: 300, width: 400, height: 20 },
                    { x: 600, y: 100, width: 20, height: 200 },
                    { x: 200, y: 600, width: 600, height: 20 },
                ],
                hideSpots: [
                    { x: 300, y: 200, width: 80, height: 40, type: 'bed' },
                    { x: 700, y: 150, width: 60, height: 60, type: 'closet' },
                    { x: 850, y: 650, width: 60, height: 60, type: 'wardrobe' },
                ],
                items: [
                    { x: 350, y: 180, type: 'key', subtype: 'front_door', points: 100 },
                    { x: 750, y: 500, type: 'weapon', subtype: 'hammer', points: 50 },
                    { x: 150, y: 700, type: 'collectible', subtype: 'photo', points: 200 },
                    { x: 600, y: 400, type: 'powerup', subtype: 'speed', points: 75 },
                ],
                exit: { x: 950, y: 400, width: 30, height: 60 },
                playerStart: { x: 100, y: 100 },
                grannyStart: { x: 800, y: 700 },
                grannyPatrol: [
                    { x: 800, y: 700 },
                    { x: 500, y: 700 },
                    { x: 300, y: 500 },
                    { x: 300, y: 200 },
                    { x: 800, y: 200 },
                ],
                requiredItems: ['key_front_door'],
                difficulty: 1,
                ambientSounds: ['creaking', 'wind'],
            },
            
            // Level 2 - More complex
            {
                name: "Granny's Living Room",
                walls: [
                    // Outer walls
                    { x: 0, y: 0, width: 1200, height: 20 },
                    { x: 0, y: 0, width: 20, height: 900 },
                    { x: 0, y: 880, width: 1200, height: 20 },
                    { x: 1180, y: 0, width: 20, height: 900 },
                    
                    // Inner walls - more complex layout
                    { x: 200, y: 100, width: 20, height: 300 },
                    { x: 200, y: 100, width: 400, height: 20 },
                    { x: 600, y: 100, width: 20, height: 200 },
                    { x: 600, y: 300, width: 200, height: 20 },
                    { x: 800, y: 150, width: 20, height: 150 },
                    { x: 800, y: 150, width: 200, height: 20 },
                    { x: 400, y: 400, width: 20, height: 300 },
                    { x: 400, y: 700, width: 400, height: 20 },
                    { x: 800, y: 500, width: 20, height: 220 },
                    { x: 600, y: 500, width: 200, height: 20 },
                ],
                hideSpots: [
                    { x: 300, y: 200, width: 80, height: 40, type: 'couch' },
                    { x: 700, y: 200, width: 60, height: 60, type: 'cabinet' },
                    { x: 900, y: 250, width: 60, height: 60, type: 'bookshelf' },
                    { x: 500, y: 600, width: 60, height: 60, type: 'table' },
                ],
                items: [
                    { x: 350, y: 180, type: 'key', subtype: 'basement', points: 150 },
                    { x: 750, y: 400, type: 'weapon', subtype: 'vase', points: 75 },
                    { x: 950, y: 200, type: 'collectible', subtype: 'diary', points: 250 },
                    { x: 300, y: 600, type: 'collectible', subtype: 'necklace', points: 300 },
                    { x: 600, y: 800, type: 'powerup', subtype: 'invisibility', points: 125 },
                    { x: 900, y: 700, type: 'key', subtype: 'drawer', points: 100 },
                ],
                exit: { x: 1150, y: 800, width: 30, height: 60 },
                playerStart: { x: 100, y: 100 },
                grannyStart: { x: 1000, y: 600 },
                grannyPatrol: [
                    { x: 1000, y: 600 },
                    { x: 700, y: 600 },
                    { x: 700, y: 400 },
                    { x: 1000, y: 400 },
                    { x: 1000, y: 200 },
                    { x: 500, y: 200 },
                ],
                requiredItems: ['key_basement', 'key_drawer'],
                difficulty: 2,
                ambientSounds: ['clock', 'floorboards', 'thunder'],
            },
            
            // Add more levels as needed
        ];
    }
    
    loadLevel(levelNum) {
        // Check if level exists
        if (levelNum > this.levels.length) {
            // If we've completed all levels, show win screen
            this.game.gameWon();
            return;
        }
        
        this.currentLevel = this.levels[levelNum - 1];
        
        // Set up granny's patrol points
        this.game.granny.setPatrolPoints(this.currentLevel.grannyPatrol);
    }
    
    render(ctx) {
        if (!this.currentLevel) return;
        
        // Draw walls
        ctx.fillStyle = '#333';
        this.currentLevel.walls.forEach(wall => {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
        
        // Draw hiding spots
        ctx.fillStyle = '#795548';
        this.currentLevel.hideSpots.forEach(spot => {
            ctx.fillRect(spot.x, spot.y, spot.width, spot.height);
            
            // Show icon based on type
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(spot.type, spot.x + 5, spot.y + 20);
            ctx.fillStyle = '#795548';
        });
        
        // Draw exit
        const exit = this.currentLevel.exit;
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
        
        // Exit text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('EXIT', exit.x + 3, exit.y + 30);
    }
    
    checkWallCollision(x, y, width, height) {
        if (!this.currentLevel) return false;
        
        // Check collision with all walls
        for (const wall of this.currentLevel.walls) {
            if (
                x < wall.x + wall.width &&
                x + width > wall.x &&
                y < wall.y + wall.height &&
                y + height > wall.y
            ) {
                return true;
            }
        }
        
        return false;
    }
    
    checkRayCollision(x1, y1, x2, y2) {
        if (!this.currentLevel) return false;
        
        // Simple ray-rectangle intersection
        // In a real game, you'd implement a more efficient algorithm
        for (const wall of this.currentLevel.walls) {
            // Check intersection with each edge of the wall
            const edges = [
                { x1: wall.x, y1: wall.y, x2: wall.x + wall.width, y2: wall.y },  // Top edge
                { x1: wall.x, y1: wall.y, x2: wall.x, y2: wall.y + wall.height }, // Left edge
                { x1: wall.x, y1: wall.y + wall.height, x2: wall.x + wall.width, y2: wall.y + wall.height }, // Bottom edge
                { x1: wall.x + wall.width, y1: wall.y, x2: wall.x + wall.width, y2: wall.y + wall.height }   // Right edge
            ];
            
            for (const edge of edges) {
                if (this.lineIntersection(x1, y1, x2, y2, edge.x1, edge.y1, edge.x2, edge.y2)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Check if two line segments intersect
        const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        
        if (denominator === 0) {
            return false;
        }
        
        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;
        
        return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
    }
    
    getHideSpotAt(x, y) {
        if (!this.currentLevel) return null;
        
        for (const spot of this.currentLevel.hideSpots) {
            if (
                x > spot.x && 
                x < spot.x + spot.width && 
                y > spot.y && 
                y < spot.y + spot.height
            ) {
                return spot;
            }
        }
        
        return null;
    }
    
    checkExitReached(player) {
        if (!this.currentLevel) return false;
        
        const exit = this.currentLevel.exit;
        
        // Check if player is at exit
        if (
            player.x > exit.x &&
            player.x < exit.x + exit.width &&
            player.y > exit.y &&
            player.y < exit.y + exit.height
        ) {
            // Check if player has all required items
            for (const itemType of this.currentLevel.requiredItems) {
                if (!player.hasItem(itemType)) {
                    // Show message that player needs this item
                    this.game.showFloatingText(
                        `Need ${itemType.replace('key_', 'the ')}`, 
                        player.x, 
                        player.y - 50, 
                        '#ff0000'
                    );
                    return false;
                }
            }
            
            return true;
        }
        
        return false;
    }
    
    getPlayerStartPosition() {
        if (!this.currentLevel) return { x: 100, y: 100 };
        return this.currentLevel.playerStart;
    }
    
    getGrannyStartPosition() {
        if (!this.currentLevel) return { x: 500, y: 500 };
        return this.currentLevel.grannyStart;
    }
    
    getItems() {
        if (!this.currentLevel) return [];
        return this.currentLevel.items;
    }
}