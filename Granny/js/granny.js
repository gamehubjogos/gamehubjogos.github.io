class Granny {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.width = 50;
        this.height = 50;
        this.speed = 120; // pixels per second
        this.detectionRange = 200;
        this.hearingRange = 300;
        
        // AI state
        this.state = 'patrolling'; // patrolling, chasing, searching, stunned
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.chaseTimer = 0;
        this.maxChaseTime = 10; // seconds
        this.searchTimer = 0;
        this.maxSearchTime = 15; // seconds
        this.stunTimer = 0;
        this.maxStunTime = 3; // seconds
        
        // Path finding
        this.path = [];
        this.pathUpdateTimer = 0;
        this.pathUpdateInterval = 0.5; // seconds
        
        // Target
        this.targetX = 0;
        this.targetY = 0;
        
        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 0.2; // seconds per frame
    }
    
    update(deltaTime) {
        switch (this.state) {
            case 'patrolling':
                this.updatePatrolling(deltaTime);
                break;
            case 'chasing':
                this.updateChasing(deltaTime);
                break;
            case 'searching':
                this.updateSearching(deltaTime);
                break;
            case 'stunned':
                this.updateStunned(deltaTime);
                break;
        }
        
        // Check if player is visible
        const player = this.game.player;
        if (!player.isHiding && this.state !== 'stunned') {
            const distance = Math.hypot(player.x - this.x, player.y - this.y);
            
            // Check line of sight
            if (distance < this.detectionRange) {
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                const hasLineOfSight = !this.game.levelManager.checkRayCollision(
                    this.x, this.y, player.x, player.y
                );
                
                if (hasLineOfSight) {
                    this.startChasing(player.x, player.y);
                }
            }
            
            // Check if player makes noise
            if (player.isRunning && distance < this.hearingRange) {
                this.startSearching(player.x, player.y);
            }
        }
        
        // Update animation
        this.animationTimer += deltaTime;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }
    
    updatePatrolling(deltaTime) {
        if (this.patrolPoints.length === 0) return;
        
        // Move towards current patrol point
        const target = this.patrolPoints[this.currentPatrolIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 5) {
            // Reached patrol point, move to next
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        } else {
            // Move towards patrol point
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * this.speed * deltaTime;
            this.y += Math.sin(angle) * this.speed * deltaTime;
        }
    }
    
    updateChasing(deltaTime) {
        // Update chase timer
        this.chaseTimer += deltaTime;
        if (this.chaseTimer >= this.maxChaseTime) {
            this.startSearching(this.targetX, this.targetY);
            return;
        }
        
        // Update path to player
        this.pathUpdateTimer += deltaTime;
        if (this.pathUpdateTimer >= this.pathUpdateInterval) {
            this.pathUpdateTimer = 0;
            this.targetX = this.game.player.x;
            this.targetY = this.game.player.y;
            this.updatePath(this.targetX, this.targetY);
        }
        
        // Follow path
        this.followPath(deltaTime);
    }
    
    updateSearching(deltaTime) {
        // Update search timer
        this.searchTimer += deltaTime;
        if (this.searchTimer >= this.maxSearchTime) {
            this.state = 'patrolling';
            return;
        }
        
        // Follow path or wander around last known position
        if (this.path.length > 0) {
            this.followPath(deltaTime);
        } else {
            // Random movement around target
            const wanderRadius = 50;
            const wanderSpeed = this.speed * 0.7;
            const angle = Math.random() * Math.PI * 2;
            
            const targetX = this.targetX + Math.cos(angle) * wanderRadius;
            const targetY = this.targetY + Math.sin(angle) * wanderRadius;
            
            // Move towards random point
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.hypot(dx, dy);
            
            if (distance > 5) {
                const moveAngle = Math.atan2(dy, dx);
                this.x += Math.cos(moveAngle) * wanderSpeed * deltaTime;
                this.y += Math.sin(moveAngle) * wanderSpeed * deltaTime;
            }
        }
    }
    
    updateStunned(deltaTime) {
        this.stunTimer += deltaTime;
        if (this.stunTimer >= this.maxStunTime) {
            this.state = 'searching';
            this.searchTimer = 0;
            this.targetX = this.game.player.x;
            this.targetY = this.game.player.y;
        }
    }
    
    followPath(deltaTime) {
        if (this.path.length === 0) return;
        
        const nextPoint = this.path[0];
        const dx = nextPoint.x - this.x;
        const dy = nextPoint.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 5) {
            // Reached next point, remove it from path
            this.path.shift();
        } else {
            // Move towards next point
            const angle = Math.atan2(dy, dx);
            
            // Calculate speed based on state
            let currentSpeed = this.speed;
            if (this.state === 'chasing') {
                currentSpeed *= 1.2; // Faster when chasing
            }
            
            this.x += Math.cos(angle) * currentSpeed * deltaTime;
            this.y += Math.sin(angle) * currentSpeed * deltaTime;
        }
    }
    
    updatePath(targetX, targetY) {
        // In a real game, you'd implement A* or other pathfinding
        // For simplicity, we'll just create a direct path
        this.path = [{ x: targetX, y: targetY }];
    }
    
    startChasing(targetX, targetY) {
        this.state = 'chasing';
        this.chaseTimer = 0;
        this.targetX = targetX;
        this.targetY = targetY;
        this.updatePath(targetX, targetY);
    }
    
    startSearching(targetX, targetY) {
        if (this.state !== 'chasing') {
            this.state = 'searching';
            this.searchTimer = 0;
            this.targetX = targetX;
            this.targetY = targetY;
            this.updatePath(targetX, targetY);
        }
    }
    
    stun() {
        this.state = 'stunned';
        this.stunTimer = 0;
    }
    
    render(ctx) {
        ctx.save();
        
        // Set color based on state
        let color;
        switch (this.state) {
            case 'patrolling':
                color = '#c0392b';
                break;
            case 'chasing':
                color = '#e74c3c';
                break;
            case 'searching':
                color = '#d35400';
                break;
            case 'stunned':
                color = '#7f8c8d';
                break;
        }
        
        // Draw granny
        ctx.translate(this.x, this.y);
        
        // Draw body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw face (direction indicator)
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        ctx.rotate(angle);
        
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(10, -8, 5, 0, Math.PI * 2); // eye
        ctx.arc(10, 8, 5, 0, Math.PI * 2); // eye
        ctx.fill();
        
        // Show detection range (optional, for debugging)
        if (this.game.debugMode) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, this.detectionRange, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(255, 165, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, this.hearingRange, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    resetPosition(position = null) {
        if (position) {
            this.x = position.x;
            this.y = position.y;
        } else {
            // Default position if none provided
            this.x = 500;
            this.y = 500;
        }
        
        this.state = 'patrolling';
    }
    
    setPatrolPoints(points) {
        this.patrolPoints = points;
        this.currentPatrolIndex = 0;
    }
}