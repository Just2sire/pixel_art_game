// Global variables for game elements
let dinosaur;
let obstacles = [];
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
    // Use windowWidth and windowHeight to make it fill the available space.
    createCanvas(min(windowWidth * 0.9, 800), min(windowHeight * 0.9, 400));

    // Set a pixel density for a more pixelated look
    pixelDensity(1);

    // Calculate ground level based on canvas height
    groundY = height - 50;

    // Initialize game speed
    gameSpeed = INITIAL_GAME_SPEED;

    // Create the dinosaur object
    dinosaur = new Dinosaur();

    // Initialize background tiles
    for (let i = 0; i < BACKGROUND_TILE_COUNT; i++) {
        backgroundTiles.push(new BackgroundTile(i * (width / BACKGROUND_TILE_COUNT)));
    }

    // Set frame rate for consistent game speed
    frameRate(60);
}

function draw() {
    // Clear the background each frame
    background(135, 206, 235); // Sky blue background

    // Draw and update background tiles
    for (let tile of backgroundTiles) {
        tile.show();
        tile.update();
    }

    // Draw the ground
    drawGround();

    if (!gameOver) {
        // Update and show the dinosaur
        dinosaur.update();
        dinosaur.show();

        // Randomly spawn obstacles
        if (frameCount % OBSTACLE_SPAWN_INTERVAL === 0) {
            obstacles.push(new Obstacle());
        }

        // Update and show obstacles, and check for collisions
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].show();

            // Check for collision
            if (dinosaur.hits(obstacles[i])) {
                gameOver = true; // Game over if collision occurs
            }

            // Remove obstacles that are off-screen
            if (obstacles[i].offscreen()) {
                obstacles.splice(i, 1);
                score++; // Increment score when an obstacle is passed
                // Gradually increase game speed
                gameSpeed += 0.1;
            }
        }

        // Display the score
        fill(0); // Black color for text
        textSize(24);
        textAlign(LEFT, TOP);
        text(`Score: ${score}`, 10, 10);
    } else {
        // Game Over screen
        fill(255, 0, 0); // Red color for game over text
        textSize(48);
        textAlign(CENTER, CENTER);
        text('GAME OVER', width / 2, height / 2 - 30);
        textSize(24);
        fill(0);
        text('Press R to Restart', width / 2, height / 2 + 20);
    }
}

// Function to handle key presses
function keyPressed() {
    if (key === ' ' || keyCode === UP_ARROW) { // Spacebar or Up Arrow for jumping
        if (!gameOver) {
            dinosaur.jump();
        }
    }
    if (key === 'r' || key === 'R') { // 'R' key to restart
        if (gameOver) {
            resetGame();
        }
    }
}

// Function to reset the game state
function resetGame() {
    score = 0;
    obstacles = [];
    gameOver = false;
    gameSpeed = INITIAL_GAME_SPEED;
    dinosaur = new Dinosaur(); // Re-initialize dinosaur to reset its position
    // Reset background tiles positions
    for (let i = 0; i < BACKGROUND_TILE_COUNT; i++) {
        backgroundTiles[i].x = i * (width / BACKGROUND_TILE_COUNT);
    }
    loop(); // Resume the draw loop
}

// Function to draw the pixelated ground
function drawGround() {
    noStroke();
    fill(139, 69, 19); // Brown color for ground
    rect(0, groundY, width, height - groundY); // Main ground rectangle

    // Add some pixelated details to the ground
    for (let i = 0; i < width; i += 10) {
        fill(100, 50, 0); // Darker brown
        rect(i, groundY + random(-5, 5), 5, 5);
    }
}

// Dinosaur Class
class Dinosaur {
    constructor() {
        this.width = 40;
        this.height = 60;
        this.x = 50;
        this.y = groundY - this.height; // Start on the ground
        this.velocityY = 0;
        this.isJumping = false;
    }

    // Make the dinosaur jump
    jump() {
        if (!this.isJumping) {
            this.velocityY = JUMP_STRENGTH;
            this.isJumping = true;
        }
    }

    // Update dinosaur's position and apply gravity
    update() {
        this.y += this.velocityY;
        this.velocityY += GRAVITY;

        // Prevent dinosaur from falling through the ground
        if (this.y >= groundY - this.height) {
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }

    // Draw the pixelated dinosaur
    show() {
        noStroke();
        fill(60, 179, 113); // Green color for dinosaur

        // Main body
        rect(this.x, this.y, this.width, this.height);

        // Head
        rect(this.x + this.width - 10, this.y + 10, 20, 20);

        // Legs (pixelated)
        fill(46, 139, 87); // Darker green
        rect(this.x + 5, this.y + this.height - 15, 10, 15);
        rect(this.x + this.width - 15, this.y + this.height - 15, 10, 15);

        // Eye (simple pixel)
        fill(255); // White eye
        rect(this.x + this.width + 5, this.y + 15, 5, 5);
        fill(0); // Black pupil
        rect(this.x + this.width + 6, this.y + 16, 2, 2);
    }

    // Check for collision with an obstacle
    hits(obstacle) {
        // Simple AABB collision detection
        return (
            this.x < obstacle.x + obstacle.width &&
            this.x + this.width > obstacle.x &&
            this.y < obstacle.y + obstacle.height &&
            this.y + this.height > obstacle.y
        );
    }
}

// Obstacle Class
class Obstacle {
    constructor() {
        this.width = random(20, 40); // Random width for variety
        this.height = random(30, 70); // Random height for variety
        this.x = width; // Start off-screen to the right
        this.y = groundY - this.height; // Position on the ground
    }

    // Update obstacle's position
    update() {
        this.x -= gameSpeed; // Move left based on game speed
    }

    // Draw the pixelated obstacle
    show() {
        noStroke();
        fill(100, 100, 100); // Grey color for obstacle

        // Main body of the obstacle (e.g., a cactus or rock)
        rect(this.x, this.y, this.width, this.height);

        // Add some pixelated details to make it look like a cactus or rock
        if (this.width > 30) { // For wider obstacles, add branches/texture
            fill(80, 80, 80); // Darker grey
            rect(this.x + this.width / 4, this.y - 10, this.width / 2, 10);
            rect(this.x + this.width / 8, this.y + this.height / 2, this.width / 4, this.height / 4);
        }
    }

    // Check if obstacle is off-screen
    offscreen() {
        return this.x < -this.width;
    }
}

// Background Tile Class for scrolling background
class BackgroundTile {
    constructor(x) {
        this.x = x;
        this.y = 0;
        this.width = width / BACKGROUND_TILE_COUNT; // Each tile takes up a portion of the screen width
        this.height = height;
        this.clouds = [];
        this.mountains = [];

        // Generate some pixelated clouds
        for (let i = 0; i < random(2, 5); i++) {
            this.clouds.push({
                x: random(this.x, this.x + this.width),
                y: random(50, height / 3),
                w: random(30, 80),
                h: random(15, 40)
            });
        }

        // Generate some pixelated mountains
        for (let i = 0; i < random(1, 3); i++) {
            this.mountains.push({
                x: random(this.x, this.x + this.width),
                y: random(height / 2, groundY - 50),
                w: random(80, 150),
                h: random(50, 100)
            });
        }
    }

    // Update background tile position
    update() {
        this.x -= gameSpeed * 0.2; // Move slower than obstacles for parallax effect

        // Loop the background tile when it goes off-screen
        if (this.x + this.width < 0) {
            this.x = width; // Reset to the right side of the screen
            // Regenerate clouds and mountains for variety
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

    // Draw the background tile elements
    show() {
        noStroke();

        // Draw clouds
        fill(255, 255, 255, 200); // Semi-transparent white
        for (let cloud of this.clouds) {
            rect(cloud.x, cloud.y, cloud.w, cloud.h);
            rect(cloud.x + cloud.w / 4, cloud.y - cloud.h / 2, cloud.w / 2, cloud.h); // Add a bump
        }

        // Draw mountains
        fill(150, 150, 150); // Greyish color for mountains
        for (let mountain of this.mountains) {
            // Simple triangle-like mountain using multiple rectangles for pixelated effect
            rect(mountain.x, mountain.y, mountain.w, mountain.h);
            rect(mountain.x + mountain.w * 0.1, mountain.y - mountain.h * 0.2, mountain.w * 0.8, mountain.h * 0.2);
            rect(mountain.x + mountain.w * 0.2, mountain.y - mountain.h * 0.4, mountain.w * 0.6, mountain.h * 0.2);
        }
    }
}

// Handle window resizing to make the canvas responsive
function windowResized() {
    resizeCanvas(min(windowWidth * 0.9, 800), min(windowHeight * 0.9, 400));
    groundY = height - 50; // Recalculate ground position
    dinosaur.y = groundY - dinosaur.height; // Adjust dinosaur position
    // Adjust background tile widths
    for (let i = 0; i < BACKGROUND_TILE_COUNT; i++) {
        backgroundTiles[i].width = width / BACKGROUND_TILE_COUNT;
        backgroundTiles[i].x = i * backgroundTiles[i].width; // Reposition tiles
    }
}
