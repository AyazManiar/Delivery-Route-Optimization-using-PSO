# RoutePSO - User Guide

## 🎯 Application Overview

RoutePSO is a sophisticated single-page application that visualizes Particle Swarm Optimization (PSO) for solving the Traveling Salesman Problem (TSP) in delivery route planning.

## 🚀 Quick Start

1. **Launch the Application**
   - Open http://localhost:3000 in your browser
   - The app loads with a default set of delivery points

2. **Generate Delivery Points**
   - Adjust the slider to select number of points (5-50)
   - Click "Generate Random Points"
   - The warehouse (red star) is always the start/end point

3. **Configure PSO Parameters**
   - **Swarm Size** (10-100): More particles = better exploration but slower
   - **Max Iterations** (50-500): How long the algorithm runs
   - **Inertia Weight** (0-1): Controls particle momentum (0.7 recommended)
   - **Cognitive Coefficient** (0-4): Personal best influence (1.5 recommended)
   - **Social Coefficient** (0-4): Global best influence (1.5 recommended)
   - **Velocity Clamp** (1-10): Limits particle speed

4. **Start Optimization**
   - Click "Start Optimization" to begin
   - Watch particles swarm and explore routes
   - The green line shows the current best route
   - Purple particles animate across delivery points

## 📊 Interface Sections

### Left Panel (Resizable)

#### Tab 1: Controls
- Point generation controls
- PSO parameter sliders
- Visualization toggles:
  - Show Particles: Display/hide particle swarm
  - Show Global Best Path: Display/hide optimal route
- Animation speed control
- Start/Pause/Reset buttons

#### Tab 2: Convergence Graph
- Real-time fitness (distance) vs iteration graph
- Best fitness value display
- Current iteration counter
- Export graph as PNG button

#### Tab 3: Statistics
- **Global Best Distance**: Shortest route found
- **Current Iteration**: Progress tracker
- **Total Runtime**: Execution time in milliseconds
- **Swarm Diversity**: Particle spread metric
- **Delivery Points**: Total points to visit
- **Frame Rate**: Canvas FPS performance
- **Best Route Found**: Sequence of point indices

### Right Panel (Main Visualization)

#### Canvas View (Default)
- **Warehouse**: Red star (start/end point)
- **Delivery Points**: Blue circles with numbers
- **Particles**: Purple dots moving along routes
- **Particle Trails**: Fading purple trails
- **Global Best Route**: Bright green line
- **FPS Counter**: Performance indicator (top-right)

#### Map View
- Real-world map using OpenStreetMap
- Warehouse marked with red "W" marker
- Delivery points as blue markers
- Optimized route as green polyline
- Zoom and pan controls
- Click markers for details

## 🎮 Controls Reference

### Top Bar
- **RoutePSO Logo**: Application branding
- **Export Route**: Download optimized route as JSON
- **Canvas/Map Toggle**: Switch visualization modes
- **Dark/Light Mode**: Theme toggle

### Simulation Controls
- **Start Optimization**: Begin PSO algorithm
- **Pause**: Temporarily stop (resume later)
- **Reset Simulation**: Clear all results and restart

### Visualization Options
- **Show Particles**: Toggle particle visibility
- **Show Global Best Path**: Toggle optimal route display
- **Animation Speed**: 0.1x to 5x speed multiplier

## 🔬 PSO Algorithm Details

### How It Works (Discrete PSO for TSP)
1. Initialize random particle swarm with random routes
2. Each particle has:
   - Position (current route as permutation)
   - Velocity (sequence of weighted swap operations)
   - Personal best (best route it found)
   - Stagnation counter (tracks convergence)
3. All particles know the global best (best route found by any particle)
4. Each iteration:
   - Generate swap sequences to reach personal and global bests
   - Update velocity as weighted combination of:
     - Inertia (current velocity with adaptive weight)
     - Cognitive swaps (moves toward personal best)
     - Social swaps (moves toward global best)
   - Apply swaps probabilistically based on weights
   - Apply 2-opt mutation (2% chance) for local improvement
   - Evaluate fitness (calculate TSP route distance)
   - Update personal and global bests
   - Handle stagnation (reinitialize if stuck)

### Parameter Tuning Guide

**For Fast Convergence:**
- Swarm Size: 20-30
- Initial Inertia Weight: 0.8 (adaptive enabled)
- Cognitive Coeff: 2.0
- Social Coeff: 2.0
- Mutation Rate: 0.03 (3%)
- 2-Opt Mutation: Enabled

**For Best Solutions:**
- Swarm Size: 50-100
- Initial Inertia Weight: 0.9 (adaptive enabled)
- Cognitive Coeff: 1.5
- Social Coeff: 1.5
- Iterations: 300-500
- Mutation Rate: 0.02 (2%)
- 2-Opt Mutation: Enabled

**Balanced (Recommended):**
- Swarm Size: 30
- Initial Inertia Weight: 0.7 (adaptive enabled)
- Cognitive Coeff: 1.5
- Social Coeff: 1.5
- Iterations: 200
- Mutation Rate: 0.02 (2%)
- 2-Opt Mutation: Enabled
- Stagnation Threshold: 20

## 💾 Export Features

### Export Route as JSON
```json
{
  "route": [0, 3, 7, 2, 5, 1, 4, 6, 0],
  "totalDistance": 245.67,
  "points": [...],
  "timestamp": "2025-11-17T..."
}
```

### Export Convergence Graph
- High-quality PNG image
- 800x600 resolution
- Includes title and axes

## 🎨 Visual Elements

### Warehouse (Start/End Point)
- **Shape**: Red star
- **Label**: "WAREHOUSE"
- **Purpose**: All routes begin and end here

### Delivery Points
- **Shape**: Blue circles
- **Numbers**: Point indices
- **Size**: 8px radius

### Particles (PSO Swarm)
- **Color**: Purple (#8b5cf6)
- **Size**: 4px radius
- **Glow**: Outer ring for visibility
- **Trails**: Fading path history

### Global Best Route
- **Color**: Bright green (#10b981)
- **Width**: 3px
- **Glow**: Shadow effect
- **Updates**: Real-time as better routes found

## ⚡ Performance Tips

1. **For Smooth Animation:**
   - Use 20-30 particles
   - Keep points under 30
   - Animation speed 1.0x

2. **For Faster Results:**
   - Disable particle visibility
   - Increase animation speed to 3-5x
   - Reduce iterations if good enough

3. **For Best Quality:**
   - Use 50+ particles
   - Run 300+ iterations
   - Enable all visualizations
   - Use slower animation to observe

## 🌐 Browser Compatibility

- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 Responsive Design

- Desktop: Full split-screen layout
- Tablet: Resizable panels (20-50% left panel width)
- All features work on any screen size

## 🔧 Troubleshooting

**Map not loading:**
- Check internet connection
- Ensure JavaScript is enabled
- Try Canvas view instead

**Slow performance:**
- Reduce particle count
- Reduce number of points
- Disable particle trails
- Use faster animation speed

**Optimization not improving:**
- Increase iterations
- Adjust PSO coefficients
- Try different random seed
- Reset and try again

## 🎓 Educational Use

Perfect for:
- Understanding PSO algorithms
- Teaching optimization techniques
- Demonstrating swarm intelligence
- Route planning visualization
- Algorithm parameter tuning experiments

## 📄 Session Persistence

All session data automatically saved to browser localStorage:
- Current points
- Best route found
- Convergence history
- Current iteration

Refresh the page to restore your session!

## 🚀 Deployment

Build for production:
```bash
npm run build
npm start
```

Deploy to Vercel:
```bash
vercel
```

---

**Developed with**: Next.js 14, TypeScript, Tailwind CSS, Canvas API, Leaflet.js, Recharts, Framer Motion

**License**: MIT
