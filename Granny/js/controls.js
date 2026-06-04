class Controls {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.mouseX = null;
        this.mouseY = null;
        this.isTouchDevice = 'ontouchstart' in window;
        
        // Initialize controls
        this.setupKeyboardControls();
        this.setupMouseControls();
        if (this.isTouchDevice) {
            this.setupTouchControls();
        }
    }
    
    setupKeyboardControls() {
        window.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Action key (E)
            if (e.key.toLowerCase() === 'e') {
                this.handleAction();
            }
            
            // Use item key (Q)
            if (e.key.toLowerCase() === 'q') {
                this.handleUseItem();
            }
        });
        
        window.addEventListener('keyup', e => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    setupMouseControls() {
        window.addEventListener('mousemove', e => {
            const rect = this.game.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        window.addEventListener('mousedown', e => {
            if (e.button === 0) { // Left click
                this.handleClick(this.mouseX, this.mouseY);
            }
        });
    }
    
    setupTouchControls() {
        // Create touch joystick and buttons
        this.createTouchInterface();
        
        window.addEventListener('touchstart', e => {
            const touch = e.touches[0];
            const rect = this.game.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.handleTouch(x, y, e);
        });
        
        window.addEventListener('touchmove', e => {
            const touch = e.touches[0];
            const rect = this.game.canvas.getBoundingClientRect();
            this.mouseX = touch.clientX - rect.left;
            this.mouseY = touch.clientY - rect.top;
            
            this.updateVirtualJoystick(this.mouseX, this.mouseY);
        });
        
        window.addEventListener('touchend', e => {
            this.resetVirtualJoystick();
        });
    }
    
    createTouchInterface() {
        // Create virtual joystick (left side)
        this.joystickContainer = document.createElement('div');
        this.joystickContainer.className = 'joystick-container';
        document.body.appendChild(this.joystickContainer);
        
        this.joystickOuter = document.createElement('div');
        this.joystickOuter.className = 'joystick-outer';
        this.joystickContainer.appendChild(this.joystickOuter);
        
        this.joystickInner = document.createElement('div');
        this.joystickInner.className = 'joystick-inner';
        this.joystickOuter.appendChild(this.joystickInner);
        
        // Create action buttons (right side)
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'buttons-container';
        document.body.appendChild(this.buttonsContainer);
        
        // Add action button
        this.actionButton = document.createElement('div');
        this.actionButton.className = 'action-button';
        this.actionButton.textContent = 'E';
        this.buttonsContainer.appendChild(this.actionButton);
        
        this.actionButton.addEventListener('touchstart', e => {
            e.preventDefault();
            this.handleAction();
        });
        
        // Add use item button
        this.useItemButton = document.createElement('div');
        this.useItemButton.className = 'use-item-button';
        this.useItemButton.textContent = 'Q';
        this.buttonsContainer.appendChild(this.useItemButton);
        
        this.useItemButton.addEventListener('touchstart', e => {
            e.preventDefault();
            this.handleUseItem();
        });
        
        // Add CSS for these elements
        const style = document.createElement('style');
        style.textContent = `
            .joystick-container {
                position: fixed;
                bottom: 50px;
                left: 50px;
                z-index: 100;
            }
            
            .joystick-outer {
                width: 120px;
                height: 120px;
                border-radius: 60px;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.4);
                position: relative;
            }
            
            .joystick-inner {
                width: 50px;
                height: 50px;
                border-radius: 25px;
                background: rgba(255, 255, 255, 0.8);
                position: absolute;
                top: 35px;
                left: 35px;
            }
            
            .buttons-container {
                position: fixed;
                bottom: 50px;
                right: 50px;
                z-index: 100;
                display: flex;
                gap: 20px;
            }
            
            .action-button, .use-item-button {
                width: 80px;
                height: 80px;
                border-radius: 40px;
                background: rgba(255, 255, 255, 0.2);
                border: 2px