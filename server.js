const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

// Serve static files
app.use(express.static('.'));

// Serve multiplayer version as default
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index-multiplayer.html');
});

// Game Constants
const WORLD_SIZE = 8000;
const INITIAL_SNAKE_LENGTH = 20;
const FOOD_COUNT = 1200;
const BOT_COUNT = 25;
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];
const MAX_RADIUS = 50;
const POWER_BOOST_INTERVAL = 120000; // 2 minutes
const POWER_BOOST_DURATION = 5000; // 5 seconds

// Game State
let snakes = [];
let foods = [];
let lastPowerBoostTime = Date.now();
let killNotifications = [];

// Initialize food
for (let i = 0; i < FOOD_COUNT; i++) {
    foods.push(createFood(false));
}

// Initialize bots
for (let i = 0; i < BOT_COUNT; i++) {
    const bot = createSnake(`Bot ${i + 1}`, COLORS[Math.floor(Math.random() * COLORS.length)], true, null);
    snakes.push(bot);
}

function createFood(isPremium = false) {
    return {
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: isPremium ? 8 : 3 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        value: isPremium ? 10 : 1,
        isPremium
    };
}

function createSnake(name, color, isBot, socketId) {
    const spawnPos = findSafeSpawnPoint();
    const segments = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        segments.push({ x: spawnPos.x, y: spawnPos.y });
    }
    
    return {
        id: socketId || Math.random().toString(36).substr(2, 9),
        name,
        color,
        isBot,
        segments,
        angle: Math.random() * Math.PI * 2,
        baseSpeed: 2,
        speed: 2,
        baseRadius: 12,
        radius: 12,
        score: 0,
        dead: false,
        isBoosting: false,
        invulnerable: 60,
        powerBoost: false,
        powerBoostEndTime: 0,
        targetAngle: 0 // For non-bots
    };
}

function findSafeSpawnPoint() {
    let bestX = Math.random() * (WORLD_SIZE - 600) + 300;
    let bestY = Math.random() * (WORLD_SIZE - 600) + 300;
    let maxMinDist = -1;

    const attempts = 15;
    for (let i = 0; i < attempts; i++) {
        const tx = Math.random() * (WORLD_SIZE - 600) + 300;
        const ty = Math.random() * (WORLD_SIZE - 600) + 300;
        let minDistToSnake = Infinity;

        snakes.forEach(s => {
            if (s.dead || s.segments.length === 0) return;
            const d = Math.hypot(s.segments[0].x - tx, s.segments[0].y - ty);
            if (d < minDistToSnake) minDistToSnake = d;
        });

        if (minDistToSnake > maxMinDist) {
            maxMinDist = minDistToSnake;
            bestX = tx;
            bestY = ty;
        }
    }
    return { x: bestX, y: bestY };
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('✅ Player connected:', socket.id);
    console.log('Total players online:', io.engine.clientsCount);
    
    socket.on('join', (data) => {
        const playerSnake = createSnake(data.name || 'Player', '#10b981', false, socket.id);
        snakes.push(playerSnake);
        
        socket.emit('init', {
            playerId: socket.id,
            worldSize: WORLD_SIZE
        });
        
        console.log(`${data.name} joined the game`);
    });
    
    socket.on('updateDirection', (data) => {
        const snake = snakes.find(s => s.id === socket.id);
        if (snake && !snake.dead) {
            snake.targetAngle = data.angle;
            snake.isBoosting = data.boosting;
        }
    });
    
    socket.on('disconnect', () => {
        const index = snakes.findIndex(s => s.id === socket.id);
        if (index !== -1) {
            snakes.splice(index, 1);
        }
        console.log('Player disconnected:', socket.id);
    });
});

// Simple bot AI (simplified version)
function updateBotAI(bot) {
    if (bot.powerBoost) {
        // Hunt nearest snake
        let nearestSnake = null;
        let minDist = Infinity;
        snakes.forEach(s => {
            if (s === bot || s.dead) return;
            const d = Math.hypot(s.segments[0].x - bot.segments[0].x, s.segments[0].y - bot.segments[0].y);
            if (d < minDist) {
                minDist = d;
                nearestSnake = s;
            }
        });
        
        if (nearestSnake) {
            bot.targetAngle = Math.atan2(nearestSnake.segments[0].y - bot.segments[0].y, nearestSnake.segments[0].x - bot.segments[0].x);
        }
    } else {
        // Look for food
        let nearest = null;
        let minDist = 400;
        foods.forEach(f => {
            const d = Math.hypot(f.x - bot.segments[0].x, f.y - bot.segments[0].y);
            if (d < minDist) {
                minDist = d;
                nearest = f;
            }
        });

        if (nearest) {
            bot.targetAngle = Math.atan2(nearest.y - bot.segments[0].y, nearest.x - bot.segments[0].x);
        } else {
            // Random movement
            bot.targetAngle += (Math.random() - 0.5) * 0.1;
        }
    }
    
    bot.isBoosting = bot.powerBoost || (Math.random() < 0.05 && bot.score > 50);
}

// Game loop
function gameLoop() {
    const now = Date.now();
    
    // Power boost timer
    if (now - lastPowerBoostTime > POWER_BOOST_INTERVAL) {
        const aliveSnakes = snakes.filter(s => !s.dead);
        if (aliveSnakes.length > 0) {
            const playerSnakes = aliveSnakes.filter(s => !s.isBot);
            let luckySnake;
            
            if (playerSnakes.length > 0 && Math.random() < 0.3) {
                luckySnake = playerSnakes[Math.floor(Math.random() * playerSnakes.length)];
            } else {
                luckySnake = aliveSnakes[Math.floor(Math.random() * aliveSnakes.length)];
            }
            
            luckySnake.powerBoost = true;
            luckySnake.powerBoostEndTime = now + POWER_BOOST_DURATION;
            lastPowerBoostTime = now;
            
            io.emit('rampage', { snakeName: luckySnake.name });
        }
    }
    
    // Update all snakes
    snakes.forEach(snake => {
        if (snake.dead) return;
        
        if (snake.invulnerable > 0) snake.invulnerable--;
        
        if (snake.powerBoost && now > snake.powerBoostEndTime) {
            snake.powerBoost = false;
        }
        
        if (snake.isBot) {
            updateBotAI(snake);
        }
        
        // Update angle smoothly
        let diff = snake.targetAngle - snake.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        snake.angle += diff * 0.06;
        
        // Update speed
        if (snake.isBoosting && snake.score > 20) {
            snake.speed = snake.baseSpeed * 2;
            if (!snake.powerBoost) snake.score -= 0.2;
        } else {
            snake.speed = snake.baseSpeed;
        }
        
        // Move snake
        const head = snake.segments[0];
        const nextX = head.x + Math.cos(snake.angle) * snake.speed;
        const nextY = head.y + Math.sin(snake.angle) * snake.speed;
        
        // Wall collision
        if (nextX < 0 || nextX > WORLD_SIZE || nextY < 0 || nextY > WORLD_SIZE) {
            killSnake(snake);
            return;
        }
        
        // Snake collision
        if (snake.invulnerable <= 0) {
            for (let other of snakes) {
                if (other.dead || other === snake) continue;
                
                for (let seg of other.segments) {
                    const dist = Math.hypot(nextX - seg.x, nextY - seg.y);
                    if (dist < snake.radius + (other.radius * 0.7)) {
                        if (snake.powerBoost) {
                            const pointsGained = Math.ceil(other.score * 0.1);
                            snake.score += pointsGained;
                            snake.radius = Math.min(MAX_RADIUS, snake.baseRadius + (snake.score * 0.005));
                            
                            killNotifications.push({
                                x: snake.segments[0].x,
                                y: snake.segments[0].y,
                                points: pointsGained,
                                createdAt: now,
                                duration: 2000
                            });
                            
                            killSnake(other);
                        } else {
                            const pointsGained = Math.ceil(snake.score * 0.1);
                            other.score += pointsGained;
                            other.radius = Math.min(MAX_RADIUS, other.baseRadius + (other.score * 0.005));
                            
                            killNotifications.push({
                                x: other.segments[0].x,
                                y: other.segments[0].y,
                                points: pointsGained,
                                createdAt: now,
                                duration: 2000
                            });
                            
                            killSnake(snake);
                        }
                        return;
                    }
                }
            }
        }
        
        // Add new head
        snake.segments.unshift({ x: nextX, y: nextY });
        
        if (snake.isBoosting && snake.segments.length > 1) {
            const prevHead = snake.segments[1];
            const midX = (nextX + prevHead.x) / 2;
            const midY = (nextY + prevHead.y) / 2;
            snake.segments.splice(1, 0, { x: midX, y: midY });
        }
        
        const targetLength = INITIAL_SNAKE_LENGTH + (snake.score / 2);
        while (snake.segments.length > targetLength) {
            snake.segments.pop();
        }
        
        // Food collision
        foods.forEach((f, idx) => {
            const dist = Math.hypot(head.x - f.x, head.y - f.y);
            if (dist < snake.radius + f.radius) {
                snake.score += f.value;
                snake.radius = Math.min(MAX_RADIUS, snake.baseRadius + (snake.score * 0.005));
                
                if (f.isPremium) {
                    foods.splice(idx, 1);
                } else {
                    foods[idx] = createFood(false);
                }
            }
        });
    });
    
    // Clean up kill notifications
    killNotifications = killNotifications.filter(n => now - n.createdAt < n.duration);
    
    // Broadcast game state
    io.emit('gameState', {
        snakes: snakes.map(s => ({
            id: s.id,
            name: s.name,
            color: s.color,
            segments: s.segments.slice(0, Math.min(s.segments.length, 100)), // Limit segments sent
            angle: s.angle,
            radius: s.radius,
            score: s.score,
            dead: s.dead,
            isBoosting: s.isBoosting,
            powerBoost: s.powerBoost,
            invulnerable: s.invulnerable
        })),
        foods,
        killNotifications
    });
}

function killSnake(snake) {
    snake.dead = true;
    
    // Drop food
    for (let i = 0; i < snake.segments.length; i += 4) {
        const f = createFood(true);
        f.x = snake.segments[i].x;
        f.y = snake.segments[i].y;
        f.color = snake.color;
        foods.push(f);
    }
    
    if (snake.isBot) {
        setTimeout(() => {
            const idx = snakes.indexOf(snake);
            if (idx > -1) snakes.splice(idx, 1);
            snakes.push(createSnake("Bot " + Math.floor(Math.random() * 1000), COLORS[Math.floor(Math.random() * COLORS.length)], true, null));
        }, 2000);
    } else {
        setTimeout(() => {
            const idx = snakes.indexOf(snake);
            if (idx > -1) snakes.splice(idx, 1);
        }, 2000);
    }
}

// Start game loop (60 FPS)
setInterval(gameLoop, 1000 / 60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🐍 Serpix.io server running on port ${PORT}`);
});

