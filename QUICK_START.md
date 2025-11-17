# 🚀 Quick Start Guide - RoutePSO

## ⚡ 60-Second Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Application
Navigate to: **http://localhost:3000**

## 🎮 First-Time Use (2 Minutes)

### Step 1: Generate Points (10 seconds)
1. Look at the left panel → Controls tab
2. Slide "Number of Delivery Points" to **15**
3. Click **"Generate Random Points"**
4. You'll see points appear on the canvas (including a red star warehouse)

### Step 2: Start Optimization (5 seconds)
1. Scroll down in the Controls tab
2. Click the big green **"Start Optimization"** button
3. Watch the magic happen! ✨

### Step 3: Watch the Results (45 seconds)
- **Right Panel**: Watch purple particles swarm around finding routes
- **Left Panel → Convergence Tab**: See the fitness graph drop as better routes are found
- **Left Panel → Statistics Tab**: Monitor real-time metrics

### Step 4: Explore Features (60 seconds)
- Toggle **"Show Particles"** on/off to see the swarm
- Adjust **"Animation Speed"** slider for slow-motion or fast-forward
- Click **"Pause"** to freeze the simulation
- Switch to **"Map View"** using the top-right toggle
- Try **Dark Mode** with the moon icon 🌙

## 🎯 Quick Tips

### For Best Visual Experience
```
Swarm Size: 30
Iterations: 200
Animation Speed: 1.0x
Show Particles: ON
Show Global Best: ON
```

### For Fast Results
```
Swarm Size: 50
Iterations: 300
Animation Speed: 3.0x
```

### For Slow Motion Study
```
Animation Speed: 0.3x
Show Particles: ON
Watch individual particles move!
```

## 🎨 Key Visual Elements

| Element | Color | What It Means |
|---------|-------|---------------|
| ⭐ Red Star | Red | Warehouse (Start/End) |
| 🔵 Blue Circles | Blue | Delivery Points |
| 🟣 Purple Dots | Purple | PSO Particles (Swarm) |
| 🟢 Green Line | Green | Best Route Found |
| 💜 Fading Trails | Purple | Particle Movement History |

## ⌨️ Keyboard Shortcuts

Currently mouse-based interface. All controls accessible via UI.

## 📤 Export Your Results

1. Run optimization until satisfied
2. Click **"Export Route"** (top-right)
3. JSON file downloads with:
   - Optimal route sequence
   - Total distance
   - All point coordinates
   - Timestamp

## 🎓 Recommended Learning Path

### Beginner (10 minutes)
1. Use default settings
2. Generate 10 points
3. Start optimization
4. Watch convergence graph
5. Switch to map view

### Intermediate (20 minutes)
1. Experiment with swarm size (10 vs 100)
2. Try different iteration counts
3. Adjust PSO coefficients
4. Compare convergence speeds
5. Export and analyze results

### Advanced (30+ minutes)
1. Test edge cases (5 points vs 50 points)
2. Fine-tune inertia weight for faster convergence
3. Use random seed for reproducible experiments
4. Analyze swarm diversity metrics
5. Export multiple scenarios for comparison

## 🐛 Troubleshooting

### Problem: Nothing appears on canvas
**Solution**: Click "Generate Random Points" first

### Problem: Optimization not improving
**Solution**: 
- Increase iterations
- Try higher swarm size
- Click "Reset" and start again

### Problem: Slow animation
**Solution**:
- Reduce number of points
- Reduce swarm size
- Turn off "Show Particles"

### Problem: Map not loading
**Solution**:
- Check internet connection
- Switch to Canvas view
- Refresh page

## 🔥 Pro Tips

1. **Fastest Convergence**: High swarm size (70-100) + moderate iterations (200)
2. **Best Quality**: Swarm size 50 + iterations 500 + inertia 0.7
3. **Visual Appeal**: Animation speed 0.5x + show all visualizations
4. **Performance**: Turn off particles for 50+ delivery points
5. **Comparison**: Use same random seed to test different parameters

## 📊 Understanding the Metrics

### Global Best Distance
- Lower = Better route
- Measured in canvas units
- Should decrease over iterations

### Swarm Diversity
- High (>70%) = Particles exploring widely
- Low (<30%) = Particles converging
- Ideal: Start high, end low

### Frame Rate (FPS)
- Target: 60 FPS
- If lower: Reduce points/particles

## 🎬 Demo Scenarios

### Scenario 1: Quick Demo (2 min)
```
Points: 10
Swarm: 30
Iterations: 100
Speed: 2x
```

### Scenario 2: Beautiful Visualization (5 min)
```
Points: 20
Swarm: 50
Iterations: 200
Speed: 0.5x
Show Particles: ON
Show Best Path: ON
```

### Scenario 3: Research Quality (10 min)
```
Points: 30
Swarm: 80
Iterations: 500
Speed: 5x (to complete faster)
Export results for analysis
```

## 🌐 Browser Recommendations

**Best**: Chrome, Edge (Chromium)
**Good**: Firefox, Safari
**Required**: Modern browser with Canvas support

## 📱 Responsive Design

- Desktop: Full experience
- Tablet: Resizable panels
- Mobile: Vertical layout (automatic)

## 🚢 Deployment

### To Vercel (Production)
```bash
vercel
```

### Custom Server
```bash
npm run build
npm start
```

## 📚 Next Steps

After quick start:
1. Read USER_GUIDE.md for detailed features
2. Read ARCHITECTURE.md for technical details
3. Experiment with different scenarios
4. Export and analyze results
5. Share your findings!

## 🎉 Have Fun!

RoutePSO is designed to be:
- **Educational**: Learn PSO visually
- **Interactive**: Experiment in real-time
- **Beautiful**: Enjoy smooth animations
- **Practical**: Export real results

Enjoy exploring the fascinating world of particle swarm optimization! 🐝✨

---

**Need help?** Check USER_GUIDE.md for comprehensive documentation.
**Want details?** See ARCHITECTURE.md for technical architecture.
