# 🚀 Quick Deployment Guide

## Test Locally First

```bash
# 1. Install Node.js (if not installed): https://nodejs.org

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open browser
# Go to http://localhost:3000
```

## Deploy to Railway (Easiest - Recommended)

### Method 1: GitHub Integration (Best)
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your Serpix.io repository
5. Railway auto-detects Node.js and deploys!
6. Click on your deployment → "Settings" → "Generate Domain"
7. Share your game URL! 🎮

### Method 2: CLI Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up
```

**Free Tier:** 500 hours/month (plenty for gaming!)

---

## Deploy to Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo (or paste Git URL)
4. Configure:
   - **Name:** serpix-io
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click "Create Web Service"
6. Wait ~2 minutes for deployment
7. Your URL: `https://serpix-io.onrender.com`

**Free Tier:** Always on, auto-deploy on push

---

## Deploy to Fly.io

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Sign up/login
fly auth signup
# or
fly auth login

# 3. Launch your app
fly launch
# Answer prompts:
# - App name: serpix-io (or your choice)
# - Region: Choose closest to you
# - PostgreSQL: No
# - Redis: No

# 4. Deploy
fly deploy

# 5. Open your game
fly open
```

**Free Tier:** 3 shared VMs, great performance

---

## Deploy to Glitch (Simplest - No CLI needed)

1. Go to [glitch.com](https://glitch.com)
2. Click "New Project" → "Import from GitHub"
3. Paste your GitHub repo URL
4. Glitch auto-deploys!
5. Your URL: `https://your-project-name.glitch.me`

**Note:** Glitch sleeps after 5 minutes of inactivity (free tier)

---

## Custom Domain (Optional)

### Railway
1. Go to your project settings
2. Click "Custom Domain"
3. Add your domain (e.g., serpix.io)
4. Update DNS records as shown

### Render
1. Go to your service settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS with provided CNAME

---

## Performance Tips

### For Better Performance:
- Choose hosting region closest to your players
- Railway & Fly.io have best performance for games
- Render is great but slightly slower (free tier)

### Monitor Your Game:
```bash
# Check server logs
railway logs  # Railway
fly logs      # Fly.io
# Or view logs in web dashboard
```

### Scale Up (If Needed):
- Railway: Upgrade to Pro ($5/month)
- Fly.io: Increase VM resources
- Render: Upgrade to Starter ($7/month)

---

## Troubleshooting

**"Port already in use":**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Can't connect after deploy:**
- Check if hosting platform assigned a PORT
- Verify in logs that server started successfully
- Wait 1-2 minutes after first deploy

**Game is laggy:**
- Choose hosting region closer to you
- Check your internet connection
- Try a different hosting platform

**Players can't join:**
- Make sure WebSocket is enabled (should be by default)
- Check firewall settings
- Verify the URL is accessible

---

## Environment Variables

No environment variables required! The server uses `process.env.PORT` which hosting platforms set automatically.

---

## Update Your Game

### Railway/Render (with GitHub)
```bash
git add .
git commit -m "Updated game"
git push
# Auto-deploys! ✨
```

### Fly.io
```bash
fly deploy
```

### Manual Updates
1. Make changes locally
2. Test with `npm start`
3. Push to hosting platform

---

## Share Your Game! 🎉

Once deployed, share your URL:
- `https://your-game.railway.app`
- `https://your-game.onrender.com`
- `https://your-game.fly.dev`

**Pro tip:** Use a URL shortener like bit.ly for easier sharing!

---

## Need Help?

- Check server logs first
- Verify Node.js version (16+)
- Test locally before deploying
- Railway/Render have great documentation

Happy gaming! 🐍✨

