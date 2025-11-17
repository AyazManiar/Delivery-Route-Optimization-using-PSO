# RoutePSO - Technical Architecture

## 🏗️ System Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────┐
│                    RoutePSO Application                  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐           ┌─────────────────────────┐ │
│  │  Left Panel  │           │    Right Panel          │ │
│  │  (Controls)  │◄─────────►│   (Visualization)       │ │
│  │              │           │                         │ │
│  │ - Controls   │           │ ┌─────────────────────┐ │ │
│  │ - Graph      │           │ │  Canvas View        │ │ │
│  │ - Stats      │           │ │  (Default)          │ │ │
│  └──────────────┘           │ └─────────────────────┘ │ │
│         │                   │          OR             │ │
│         │                   │ ┌─────────────────────┐ │ │
│         │                   │ │  Map View           │ │ │
│         └──────────────────►│ │  (Leaflet)          │ │ │
│                             │ └─────────────────────┘ │ │
│                             └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   PSO Engine     │
              │   (Core Logic)   │
              └──────────────────┘
```

## 📁 Project Structure

```
Website/
├── app/
│   ├── page.tsx                 # Main application (400+ lines)
│   ├── layout.tsx               # Root layout with metadata
│   └── globals.css              # Global styles + Tailwind
│
├── components/
│   ├── CanvasVisualization.tsx  # Canvas renderer (60 FPS)
│   ├── MapVisualization.tsx     # Leaflet map integration
│   ├── ControlPanel.tsx         # PSO parameter controls
│   ├── ConvergenceGraph.tsx     # Recharts line graph
│   └── StatisticsPanel.tsx      # Real-time metrics
│
├── lib/
│   └── pso-engine.ts            # PSO algorithm implementation
│
├── public/
│   └── index.html               # HTML entry point
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind setup
├── postcss.config.js            # PostCSS config
├── next.config.js               # Next.js config
├── README.md                    # Project overview
├── USER_GUIDE.md                # User documentation
└── .gitignore                   # Git ignore rules
```

## 🧩 Component Architecture

### 1. Main Application (`app/page.tsx`)
**Purpose**: Orchestrates entire application state and layout

**State Management**:
```typescript
// UI State
- darkMode: boolean
- viewMode: 'canvas' | 'map'
- activeTab: 'controls' | 'graph' | 'stats'
- leftPanelWidth: number

// PSO Configuration
- points: Point[]
- numPoints: number
- swarmSize: number
- iterations: number
- inertiaWeight: number
- cognitiveCoeff: number
- socialCoeff: number
- velocityClamp: number
- randomSeed: string

// Visualization Options
- showParticles: boolean
- showGlobalBest: boolean
- animationSpeed: number

// Simulation State
- isRunning: boolean
- isPaused: boolean

// Results
- globalBest: number[]
- globalBestFitness: number
- currentIteration: number
- convergenceHistory: number[]
- particles: Particle[]
- swarmDiversity: number
- totalRuntime: number
- fps: number
```

**Key Features**:
- Resizable panel with mouse drag
- Auto-save to localStorage
- Dark mode toggle
- Export functionality
- View mode switching

### 2. PSO Engine (`lib/pso-engine.ts`)
**Purpose**: Core optimization algorithm

**Classes**:
```typescript
class PSOEngine {
  // Initialization
  constructor(points: Point[], config: PSOConfig)
  
  // Core Algorithm
  step(): PSOResult                    // One iteration
  getBestRoute(): number[]             // Get complete route
  getSwarmDiversity(): number          // Particle spread
  
  // Internal Methods
  private precomputeDistances()        // Distance matrix
  private calculateDistance()          // Euclidean distance
  private initializeSwarm()            // Random initialization
  private calculateRouteFitness()      // TSP distance
  private updatePosition()             // Apply velocity
  private getResult()                  // Current state
}
```

**Algorithm Flow (Discrete PSO)**:
1. **Initialization**:
   - Create distance matrix (O(n²))
   - Generate random routes for each particle
   - Initialize velocities as random swap sequences
   - Evaluate initial fitness
   - Cache warehouse index

2. **Iteration Step (Discrete PSO)**:
   - Generate swap sequences:
     ```
     cognitiveSwaps = swaps to reach personalBest
     socialSwaps = swaps to reach globalBest
     ```
   - Update velocity (discrete):
     ```
     velocity = combine(
       w * currentVelocity,
       c1 * r1 * cognitiveSwaps,
       c2 * r2 * socialSwaps
     )
     ```
   - Adaptive inertia: `w = w_max - (iter/maxIter)*(w_max - w_min)`
   - Apply weighted swaps probabilistically
   - Apply mutation (2% chance):
     - 2-opt local search (70%)
     - Simple swap mutation (30%)
   - Evaluate new fitness
   - Update personal best if improved
   - Update global best if improved
   - Handle stagnation detection

3. **Route Representation**:
   - Warehouse is fixed and cached
   - Particle position = permutation of delivery point indices
   - Velocity = array of SwapOperation {i, j, weight}
   - Full route = [warehouse, ...position, warehouse]

### 3. Canvas Visualization (`components/CanvasVisualization.tsx`)
**Purpose**: High-performance particle rendering

**Features**:
- 60 FPS rendering using requestAnimationFrame
- Particle trails with alpha fading
- Adaptive scaling based on point bounds
- Real-time FPS counter
- Warehouse star shape rendering
- Smooth animations

**Rendering Pipeline**:
```javascript
1. Clear canvas
2. Calculate coordinate transformation (data → screen)
3. Render particle trails (fading alpha)
4. Render global best route (green line with glow)
5. Render particle routes (faint purple)
6. Render animated particles (moving circles)
7. Render delivery points (blue circles)
8. Render warehouse (red star)
9. Render FPS counter
10. Request next frame
```

**Performance Optimizations**:
- Distance matrix precomputation
- Canvas coordinate caching
- Trail length limiting (max 20 points)
- devicePixelRatio scaling
- Conditional rendering based on isPlaying

### 4. Map Visualization (`components/MapVisualization.tsx`)
**Purpose**: Geographic route display

**Features**:
- OpenStreetMap integration
- Custom marker icons (SVG)
- Route polyline rendering
- Auto-fit bounds
- Zoom/pan controls
- Popup information

**Coordinate Conversion**:
```typescript
// Simple canvas → lat/lon conversion
toLatLon(point: Point): [number, number] {
  centerLat + point.y * scaleFactor,
  centerLon + point.x * scaleFactor
}
```

**SSR Handling**:
- Dynamic import with `{ ssr: false }`
- Client-side only rendering
- Loading state while mounting

### 5. Control Panel (`components/ControlPanel.tsx`)
**Purpose**: User input interface

**Sections**:
1. **Point Generation**
   - Slider: 5-50 points
   - Generate button

2. **PSO Parameters**
   - 7 parameter sliders
   - Random seed input

3. **Visualization Options**
   - Toggle switches (custom styled)
   - Animation speed slider

4. **Control Buttons**
   - Start/Pause (dynamic)
   - Reset

**UI Components**:
- Custom range sliders
- Toggle switches (no external library)
- Icon buttons (lucide-react)

### 6. Convergence Graph (`components/ConvergenceGraph.tsx`)
**Purpose**: Fitness tracking visualization

**Features**:
- Recharts line graph
- Responsive container
- Real-time updates
- Export to PNG (custom canvas rendering)
- Metric cards (best fitness, iteration)

**Export Implementation**:
```typescript
exportAsPNG() {
  1. Create hidden canvas
  2. Draw white background
  3. Draw title and axes
  4. Plot data points and line
  5. Convert to data URL
  6. Download as PNG
}
```

### 7. Statistics Panel (`components/StatisticsPanel.tsx`)
**Purpose**: Real-time performance metrics

**Metrics Displayed**:
- Global best distance
- Current iteration
- Total runtime
- Swarm diversity
- Delivery points count
- Frame rate

**UI Design**:
- 2-column grid layout
- Icon + label + value cards
- Color-coded backgrounds
- Route preview (first 10 points)
- Progress summary card

## 🔄 Data Flow

### Initialization Flow
```
User → Generate Points
  ↓
Random Point Generation
  ↓
State Update (setPoints)
  ↓
Canvas/Map Re-render
```

### Optimization Flow
```
User → Start Optimization
  ↓
Create PSO Engine
  ↓
Initialize Swarm
  ↓
Iteration Loop:
  ├→ PSO Step
  ├→ Update State
  ├→ Render Canvas
  ├→ Update Graph
  └→ Update Stats
  ↓
Completion (or pause)
```

### Export Flow
```
User → Export Route
  ↓
Gather Current State
  ↓
Format as JSON
  ↓
Create Blob
  ↓
Download File
```

## 🎨 Styling Architecture

### Tailwind CSS Classes
```css
/* Color Scheme */
Primary: blue-500/600
Secondary: purple-500/600
Success: green-500/600
Warning: yellow-500/600
Danger: red-500/600

/* Dark Mode */
.dark → Automatic class-based toggling
bg-gray-800/900 for dark backgrounds
text-gray-100/200 for dark text

/* Layout */
Flexbox for main split
Grid for stats/metrics
Responsive width percentages
```

### Framer Motion Animations
```typescript
// Tab switching
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: 20 }}
transition={{ duration: 0.2 }}

// Status badge
animate={{ opacity: [1, 0.5, 1] }}
transition={{ duration: 2, repeat: Infinity }}
```

## 🔧 Configuration Files

### `next.config.js`
- Disables fs/net/tls for browser compatibility
- Enables React strict mode

### `tsconfig.json`
- Strict type checking
- Path aliases (@/*)
- ESNext module resolution

### `tailwind.config.js`
- Dark mode: 'class'
- Custom colors (primary, secondary)
- Custom animations (pulse-slow)

## 📊 Performance Characteristics

### Time Complexity
- **Distance Matrix**: O(n²) - one-time precomputation
- **PSO Step**: O(p * n) - p particles, n points
- **Route Evaluation**: O(n) - linear in points
- **Canvas Render**: O(p + n) - particles + points

### Space Complexity
- **Distance Matrix**: O(n²)
- **Particle Swarm**: O(p * n)
- **Convergence History**: O(i) - i iterations
- **Total**: O(n² + p*n + i)

### Target Performance
- **60 FPS** rendering (16.67ms per frame)
- **100ms** per PSO iteration (adjustable)
- **Supports** up to 50 points efficiently
- **Supports** up to 100 particles smoothly

## 🌐 Browser APIs Used

### Core APIs
- **Canvas 2D Context**: Particle rendering
- **requestAnimationFrame**: Smooth animations
- **localStorage**: Session persistence
- **Blob API**: File downloads
- **MouseEvent**: Panel resizing

### External Libraries
- **Leaflet.js**: Map rendering
- **Recharts**: Graph visualization
- **Framer Motion**: UI animations
- **Lucide React**: Icon components

## 🔐 Type Safety

### Key Interfaces
```typescript
interface Point {
  x: number;
  y: number;
  lat?: number;
  lon?: number;
  isWarehouse?: boolean;
}

interface Particle {
  position: number[];
  velocity: number[];
  personalBest: number[];
  personalBestFitness: number;
  currentFitness: number;
}

interface PSOConfig {
  swarmSize: number;
  iterations: number;
  inertiaWeight: number;
  cognitiveCoeff: number;
  socialCoeff: number;
  velocityClamp: number;
  randomSeed?: number;
}

interface PSOResult {
  globalBest: number[];
  globalBestFitness: number;
  iteration: number;
  particles: Particle[];
  convergenceHistory: number[];
}
```

## 🚀 Optimization Opportunities

### Current Optimizations
✅ Distance matrix precomputation
✅ RequestAnimationFrame for rendering
✅ Conditional trail limiting
✅ Device pixel ratio scaling
✅ Memoized computations in React

### Future Enhancements
🔲 Web Workers for PSO computation
🔲 Canvas offscreen rendering
🔲 Virtualized convergence graph (large datasets)
🔲 WebGL acceleration for particles
🔲 Service Worker for offline support
🔲 IndexedDB for larger session storage

## 📦 Build Output

### Production Build
```bash
npm run build

Output:
.next/
├── static/
│   ├── chunks/     # Code splitting
│   ├── css/        # Optimized CSS
│   └── media/      # Static assets
└── server/
    ├── app/        # Server components
    └── pages/      # API routes
```

### Bundle Size (Estimated)
- **Initial Load**: ~250KB (gzipped)
- **Canvas Component**: ~15KB
- **PSO Engine**: ~8KB
- **Leaflet**: ~140KB (lazy loaded)
- **Recharts**: ~80KB (lazy loaded)

## 🧪 Testing Strategy

### Recommended Tests
1. **Unit Tests**
   - PSO algorithm correctness
   - Distance calculations
   - Route permutation logic

2. **Integration Tests**
   - State management flow
   - Canvas rendering accuracy
   - Export functionality

3. **Performance Tests**
   - 60 FPS maintenance
   - Large particle counts
   - Many delivery points

4. **E2E Tests**
   - Complete optimization workflow
   - View mode switching
   - Dark mode toggle

---

**Technology Stack**: Next.js 14 + TypeScript + Tailwind CSS + Canvas API + Leaflet.js + Recharts + Framer Motion

**Architecture Pattern**: Component-based with centralized state management

**Rendering Strategy**: Client-side with SSR for initial load
