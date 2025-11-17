# RoutePSO

Dynamic Delivery Route Optimization using Particle Swarm Optimization (PSO) with real-time visualization.

Website: https://delivery-route-optimization-using-p.vercel.app/

## Features

- 🎯 **Real-time PSO Simulation** - Watch particles explore and converge to optimal routes
- 📊 **Live Convergence Tracking** - Interactive graphs showing fitness improvement
- 🗺️ **Dual Visualization Modes** - Canvas-based particle animation and Leaflet map view
- ⚙️ **Configurable Parameters** - Fine-tune PSO behavior with intuitive controls
- 📈 **Performance Statistics** - Track swarm diversity, iteration count, and runtime
- 🌓 **Dark/Light Mode** - Comfortable viewing in any environment
- 💾 **Export Capabilities** - Save routes as JSON and graphs as PNG
- 🎨 **Smooth Animations** - 60 FPS particle trails with Framer Motion transitions

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Usage

1. **Generate Points** - Click "Generate Random Points" to create delivery locations
2. **Configure PSO** - Adjust swarm size, iterations, and coefficients
3. **Start Optimization** - Click "Start Optimization" to begin
4. **Monitor Progress** - Switch between Controls, Convergence, and Statistics tabs
5. **View Results** - Toggle between Canvas and Map views
6. **Export Data** - Save optimized routes and convergence graphs

## PSO Parameters

- **Swarm Size**: Number of particles exploring solution space
- **Iterations**: Maximum optimization steps
- **Inertia Weight (w)**: Initial particle momentum (0.7-0.9 recommended, adaptive)
- **Cognitive Coefficient (c1)**: Personal best influence (1.5-2.0)
- **Social Coefficient (c2)**: Global best influence (1.5-2.0)
- **Velocity Clamp**: Maximum swap operations per iteration
- **Mutation Rate**: Probability of applying 2-opt or swap mutation (2% default)
- **Adaptive Inertia**: Automatically decreases inertia over time (enabled by default)
- **2-Opt Mutation**: Industry-standard TSP local search (enabled by default)
- **Stagnation Threshold**: Iterations before swarm reinitialization (20 default)

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Convergence graphs
- **Leaflet.js** - Map visualization
- **HTML Canvas** - Particle rendering

## Architecture

```
├── app/
│   ├── page.tsx          # Main application
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── CanvasVisualization.tsx    # Canvas renderer
│   ├── MapVisualization.tsx       # Leaflet map
│   ├── ControlPanel.tsx           # PSO controls
│   ├── ConvergenceGraph.tsx       # Fitness graph
│   └── StatisticsPanel.tsx        # Performance stats
└── lib/
    └── pso-engine.ts     # PSO algorithm
```
