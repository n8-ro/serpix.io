# Serpix.io - Online Multiplayer Snake Game

A fast-paced multiplayer snake game with bots, rampage mode, and smooth gameplay like slither.io!

## 🚀 Quick Start (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🌐 Free Hosting Options

### Option 1: Railway (Recommended)
1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Connect your repository
4. Railway will auto-detect and deploy!
5. Get your live URL (e.g., `https://serpix.up.railway.app`)

**Free tier:** 500 hours/month, plenty for a game!

### Option 2: Render
1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click "Create Web Service"

**Free tier:** Always on, automatic SSL

### Option 3: Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

**Free tier:** 3 shared VMs, good performance

## 📝 Environment Variables

No environment variables required! The server uses `process.env.PORT` which is automatically set by hosting platforms.

## 🎮 Features

- **Real-time Multiplayer:** Play with people worldwide
- **Bots:** AI-controlled snakes keep the game active
- **Rampage Mode:** Random power-ups every 2 minutes
- **Kill Notifications:** See your gains when eliminating opponents
- **Smooth Controls:** No lag, responsive gameplay
- **Mobile Support:** Touch controls for mobile devices
- **King Indicator:** Gold crown orbits the #1 player
- **Minimap:** See all snakes on the map

## 🔧 How It Works

- **Server:** Node.js + Express + Socket.IO
- **Client:** Pure HTML5 Canvas + JavaScript
- **Communication:** WebSocket for real-time updates
- **Game Loop:** 60 FPS on server, smooth rendering on client
- **State Management:** Server-authoritative to prevent cheating

## 🎯 Performance Tips

- Server sends up to 100 segments per snake to reduce bandwidth
- Kill notifications auto-cleanup after 2 seconds
- Game state broadcasts at 60 FPS
- Efficient collision detection

## 📱 Controls

- **Desktop:** Move mouse to steer, hold click to boost
- **Mobile:** Swipe to steer, double-tap to boost

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Can't connect:**
- Check firewall settings
- Ensure port 3000 is open
- For production, use the hosting platform's URL

## 🎨 Customization

Edit these constants in `server.js`:
- `WORLD_SIZE`: Map size
- `BOT_COUNT`: Number of AI snakes
- `FOOD_COUNT`: Amount of food
- `POWER_BOOST_INTERVAL`: Rampage frequency
- `POWER_BOOST_DURATION`: Rampage duration

## 📊 Scalability

Current setup handles:
- ~50 concurrent players comfortably
- 25 bots
- 1200 food items
- 60 FPS game loop

For more players, consider:
- Redis for state management
- Multiple game rooms
- Load balancing

## 🤝 Contributing

Feel free to improve the game! Some ideas:
- Skins and customization
- Power-ups and special abilities
- Tournament mode
- Chat system
- Leaderboard persistence

## 📜 License

MIT License - Feel free to use and modify!

---

**Made with ❤️ for the snake game community**

