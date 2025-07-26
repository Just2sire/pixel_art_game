// Global variables for game elements
let dinosaur;
let obstacles = []; // This array will now hold both ground obstacles and birds
let score = 0;
let gameOver = false;
let groundY; // Y-coordinate for the ground level
let gameSpeed; // Speed at which obstacles and background move
let backgroundTiles = []; // Array to hold background elements

// Constants for game tuning
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const INITIAL_GAME_SPEED = 6;
const OBSTACLE_SPAWN_INTERVAL = 120; // Frames between obstacle spawns
const BACKGROUND_TILE_COUNT = 3; // Number of background tiles to draw

function setup() {
    // Create the canvas. It will be responsive due to CSS.
    // Use min() to ensure it doesn't exceed certain dimensions while being responsive.
    createCanvas(min(windowWidth * 0.9, 800), min(windowHeight * 0.9, 400));

    // Set a pixel density of 1 for a more pixelated look, especially on high-DPI screens
    pixelDensity(1);

    // Calculate ground level based on canvas height
    groundY = height - 50;

    // Initialize game speed
    gameSpeed = INITIAL_GAME_SPEED;

    // Create the dinosaur object
    dinosaur = new Dinosaur();

    // Initialize background tiles for the parallax effect
    for (let i = 0; i < BACKGROUND_TILE_COUNT; i++) {
        backgroundTiles.push(new BackgroundTile(i * (width / BACKGROUND_TILE_COUNT)));
    }

    // Set frame rate for consistent game speed across different machines
    frameRate(60);
}

function draw() {
    // Clear the background each frame to prepare for new drawing
    background(135, 206, 235); // Sky blue background color

    // Draw and update background tiles to create the scrolling parallax effect
    for (let tile of backgroundTiles) {
        tile.show();
        tile.update();
    }

    // Draw the static ground layer
    drawGround();

    if (!gameOver) {
        // Update and show the dinosaur if the game is active
        dinosaur.update();
        dinosaur.show();

        // Logic to randomly spawn either a ground obstacle or a flying bird
        if (frameCount % OBSTACLE_SPAWN_INTERVAL === 0) {
            // Randomly decide between a ground obstacle (Obstacle) or a flying bird (Bird)
            if (random(1) < 0.6) { // 60% chance for a ground obstacle
                obstacles.push(new Obstacle());
            } else { // 40% chance for a bird obstacle
                obstacles.push(new Bird());
            }
        }

        // Iterate through obstacles (both ground and birds)
        // Loop backwards to safely remove elements from the array
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update(); // Update obstacle's position
            obstacles[i].show();   // Draw the obstacle

            // Check for collision between dinosaur and the current obstacle
            if (dinosaur.hits(obstacles[i])) {
                gameOver = true; // Set game over flag if collision occurs
            }

            // Remove obstacles that have moved off-screen to the left
            if (obstacles[i].offscreen()) {
                obstacles.splice(i, 1); // Remove the obstacle from the array
                score++; // Increment score for each obstacle successfully passed
                // Gradually increase game speed to make the game harder over time
                gameSpeed += 0.1;
            }
        }

        // Display the current score on the top-left corner
        fill(0); // Black color for text
        textSize(24);
        textAlign(LEFT, TOP);
        text(`Score: ${score}`, 10, 10);
    } else {
        // Game Over screen display
        fill(255, 0, 0); // Red color for "GAME OVER" text
        textSize(48);
        textAlign(CENTER, CENTER);
        text('GAME OVER', width / 2, height / 2 - 30);
        textSize(24);
        fill(0); // Black color for restart instruction
        text('Press R to Restart', width / 2, height / 2 + 20);
    }
}

// Function to handle keyboard input
function keyPressed() {
    // Check for Spacebar or Up Arrow key press for jumping
    if (key === ' ' || keyCode === UP_ARROW) {
        if (!gameOver) { // Only allow jumping if the game is not over
            dinosaur.jump(); // Call the dinosaur's jump method
        }
    }
    // Check for 'R' key press to restart the game
    if (key === 'r' || key === 'R') {
        if (gameOver) { // Only allow restart if the game is over
            resetGame(); // Call the game reset function
        }
    }
}

// Function to reset all game elements and state
function resetGame() {
    score = 0; // Reset score
    obstacles = []; // Clear all obstacles
    gameOver = false; // Reset game over flag
    gameSpeed = INITIAL_GAME_SPEED; // Reset game speed to initial value
    dinosaur = new Dinosaur(); // Re-initialize dinosaur to reset its position and jump count
    // Reset background tiles positions to their initial state
    for (let i = 0; i < BACKGROUND_TILE_COUNT; i++) {
        backgroundTiles[i].x = i * (width / BACKGROUND_TILE_COUNT);
    }
    loop(); // Resume the draw loop (it's automatically paused when gameOver is true)
}

// Function to draw the pixelated ground layer
function drawGround() {
    noStroke(); // No outline for the ground shapes
    fill(139, 69, 19); // Brown color for the main ground
    rect(0, groundY, width, height - groundY); // Draw the main ground rectangle

    // Add some pixelated texture/details to the ground
    for (let i = 0; i < width; i += 10) {
        fill(100, 50, 0); // Darker brown for ground details
        // Draw small rectangles at random y-offsets to create a rough, pixelated edge
        rect(i, groundY + random(-5, 5), 5, 5);
    }
}

// Dinosaur Class: Represents the player character
class Dinosaur {
    constructor() {
        this.width = 40;
        this.height = 60;
        this.x = 50;
        this.y = groundY - this.height; // Start on the ground level
        this.velocityY = 0;
        this.jumpsAvailable = 2; // New: Allows for two jumps (double jump)
    }

    // Method to make the dinosaur jump
    jump() {
        // Allow jump only if jumps are available
        if (this.jumpsAvailable > 0) {
            this.velocityY = JUMP_STRENGTH; // Apply upward velocity
            this.jumpsAvailable--; // Decrement available jumps
        }
    }

    // Update dinosaur's position and apply physics (gravity)
    update() {
        this.y += this.velocityY; // Apply vertical velocity
        this.velocityY += GRAVITY; // Apply gravity, pulling the dinosaur down

        // Prevent dinosaur from falling below the ground
        if (this.y >= groundY - this.height) {
            this.y = groundY - this.height; // Snap to ground
            this.velocityY = 0; // Stop vertical movement
            this.jumpsAvailable = 2; // Reset jumps available when on the ground
        }
    }

    // Draw the pixelated dinosaur character
    show() {
        noStroke(); // No outline for dinosaur shapes
        fill(60, 179, 113); // Green color for dinosaur body

        // Main body rectangle
        rect(this.x, this.y, this.width, this.height);

        // Head (slightly offset from main body)
        rect(this.x + this.width - 10, this.y + 10, 20, 20);

        // Legs (simple pixelated rectangles)
        fill(46, 139, 87); // Darker green for legs
        rect(this.x + 5, this.y + this.height - 15, 10, 15);
        rect(this.x + this.width - 15, this.y + this.height - 15, 10, 15);

        // Eye (simple white pixel with a black pupil)
        fill(255); // White for the eye
        rect(this.x + this.width + 5, this.y + 15, 5, 5);
        fill(0); // Black for the pupil
        rect(this.x + this.width + 6, this.y + 16, 2, 2);
    }

    // Check for collision with any given obstacle
    hits(obstacle) {
        // Simple Axis-Aligned Bounding Box (AABB) collision detection
        return (
            this.x < obstacle.x + obstacle.width && // Dino's left edge past obstacle's right edge
            this.x + this.width > obstacle.x &&     // Dino's right edge past obstacle's left edge
            this.y < obstacle.y + obstacle.height && // Dino's top edge past obstacle's bottom edge
            this.y + this.height > obstacle.y       // Dino's bottom edge past obstacle's top edge
        );
    }
}

// Obstacle Class: Represents ground-based obstacles (e.g., cacti, rocks)
class Obstacle {
    constructor() {
        this.width = random(20, 40); // Random width for variety
        this.height = random(30, 70); // Random height for variety
        this.x = width; // Start off-screen to the right
        this.y = groundY - this.height; // Position on the ground level
    }

    // Update obstacle's horizontal position
    update() {
        this.x -= gameSpeed; // Move left based on the current game speed
    }

    // Draw the pixelated ground obstacle
    show() {
        noStroke(); // No outline
        fill(100, 100, 100); // Grey color for obstacle

        // Main body of the obstacle (e.g., a cactus or rock shape)
        rect(this.x, this.y, this.width, this.height);

        // Add some pixelated details to make it look more like a natural object
        if (this.width > 30) { // For wider obstacles, add branches/texture
            fill(80, 80, 80); // Darker grey for details
            rect(this.x + this.width / 4, this.y - 10, this.width / 2, 10); // Top part
            rect(this.x + this.width / 8, this.y + this.height / 2, this.width / 4, this.height / 4); // Side part
        }
    }

    // Check if the obstacle has moved completely off-screen to the left
    offscreen() {
        return this.x < -this.width;
    }
}

// Bird Class: Represents flying obstacles
class Bird {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = width; // Start off-screen to the right
        // Birds fly at varying heights, above the ground obstacles
        this.y = random(height / 3, groundY - 100);
    }

    // Update bird's horizontal position
    update() {
        this.x -= gameSpeed * 1.2; // Birds might fly slightly faster than ground obstacles
    }

    // Draw the pixelated bird
    show() {
        noStroke();
        fill(255, 165, 0); // Orange color for the bird

        // Main body of the bird
        rect(this.x, this.y, this.width, this.height);

        // Wings (simple rectangles for pixelated effect)
        fill(200, 130, 0); // Darker orange for wings
        rect(this.x + 5, this.y - 10, this.width - 10, 10); // Top wing
        rect(this.x + 5, this.y + this.height, this.width - 10, 10); // Bottom wing

        // Head/Beak (small pixelated details)
        fill(0); // Black for head/eye
        rect(this.x + this.width - 10, this.y + 5, 10, 10); // Head
        fill(255, 255, 0); // Yellow for beak
        rect(this.x + this.width, this.y + 8, 5, 5); // Beak
    }

    // Check if the bird has moved completely off-screen to the left
    offscreen() {
        return this.x < -this.width;
    }
}

// Background Tile Class for creating the scrolling parallax background
class BackgroundTile {
    constructor(x) {
        this.x = x;
        this.y = 0;
        this.width = width / BACKGROUND_TILE_COUNT; // Each tile takes up a portion of the screen width
        this.height = height;
        this.clouds = [];
        this.mountains = [];

        // Generate some pixelated clouds for this tile
        for (let i = 0; i < random(2, 5); i++) {
            this.clouds.push({
                x: random(this.x, this.x + this.width),
                y: random(50, height / 3), // Clouds are in the upper part of the sky
                w: random(30, 80),
                h: random(15, 40)
            });
        }

        // Generate some pixelated mountains for this tile
        for (let i = 0; i < random(1, 3); i++) {
            this.mountains.push({
                x: random(this.x, this.x + this.width),
                y: random(height / 2, groundY - 50), // Mountains are between sky and ground
                w: random(80, 150),
                h: random(50, 100)
            });
        }
    }

    // Update background tile position for parallax effect
    update() {
        this.x -= gameSpeed * 0.2; // Move slower than obstacles to create depth

        // Loop the background tile when it goes completely off-screen to the left
        if (this.x + this.width < 0) {
            this.x = width; // Reset its position to the right side of the screen
            // Regenerate clouds and mountains for variety in the looping background
            this.clouds = [];
            for (let i = 0; i < random(2, 5); i++) {
                this.clouds.push({
                    x: random(this.x, this.x + this.width),
                    y: random(50, height / 3),
                    w: random(30, 80),
                    h: random(15, 40)
                });
            }
            this.mountains = [];
            for (let i = 0; i < random(1, 3); i++) {
                this.mountains.push({
                    x: random(this.x, this.x + this.width),
                    y: random(height / 2, groundY - 50),
                    w: random(80, 150),
                    h: random(50, 100)
                });
            }
        }
    }

    // Draw the elements within the background tile
    show() {
        noStroke(); // No outline for background elements

        // Draw clouds
        fill(255, 255, 255, 200); // Semi-transparent white for clouds
        for (let cloud of this.clouds) {
            rect(cloud.x, cloud.y, cloud.w, cloud.h);
            rect(cloud.x + cloud.w / 4, cloud.y - cloud.h / 2, cloud.w / 2, cloud.h); // Add a bump for cloud shape
        }

        // Draw mountains
        fill(150, 150, 150); // Greyish color for mountains
        for (let mountain of this.mountains) {
            // Simple pixelated mountain shape using multiple rectangles
            rect(mountain.x, mountain.y, mountain.w, mountain.h);
            rect(mountain.x + mountain.w * 0.1, mountain.y - mountain.h * 0.2, mountain.w * 0.8, mountain.h * 0.2);
            rect(mountain.x + mountain.w * 0.2, mountain.y - mountain.h * 0.4, mountain.w * 0.6, mountain.h * 0.2);
        }
    }
}

// Handle window resizing to make the canvas responsive
function windowResized() {
    // Resize the canvas based on window dimensions, maintaining max limits
    resizeCanvas(min(windowWidth * 0.9, 800), min(windowHeight * 0.9, 400));
    groundY = height - 50; // Recalculate ground position based on new height
    dinosaur.y = groundY - dinosaur.height; // Adjust dinosaur position to stay on ground
    // Adjust background tile widths and reposition them correctly after resize
    for (let i = 0; i < BACKGROUND_TILE_COUNT; i++) {
        backgroundTiles[i].width = width / BACKGROUND_TILE_COUNT;
        backgroundTiles[i].x = i * backgroundTiles[i].width; // Reposition tiles
    }
}
