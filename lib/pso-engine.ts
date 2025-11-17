
// Discrete PSO Algorithm Engine for Route Optimization (TSP)
// Implements proper discrete PSO with swap sequences, 2-opt mutation, and adaptive parameters

export interface Point {
  x: number;
  y: number;
  lat?: number;
  lon?: number;
  isWarehouse?: boolean;
}

// Swap operation for discrete velocity representation
export interface SwapOperation {
  i: number;
  j: number;
  weight: number; // Influence weight for this swap
}

export interface Particle {
  position: number[]; // Route as array of indices
  velocity: SwapOperation[]; // Discrete velocity as swap sequence
  personalBest: number[];
  personalBestFitness: number;
  currentFitness: number;
  stagnationCounter: number; // Tracks iterations without improvement
}

export interface PSOConfig {
  swarmSize: number;
  iterations: number;
  inertiaWeight: number;
  cognitiveCoeff: number;
  socialCoeff: number;
  velocityClamp: number;
  randomSeed?: number;
  mutationRate?: number; // Default 0.02 (2%)
  adaptiveInertia?: boolean; // Default true
  use2OptMutation?: boolean; // Default true
  stagnationThreshold?: number; // Default 20 iterations
}

export interface PSOResult {
  globalBest: number[];
  globalBestFitness: number;
  iteration: number;
  particles: Particle[];
  convergenceHistory: number[];
}

export class PSOEngine {
  private points: Point[];
  private config: PSOConfig;
  private particles: Particle[] = [];
  private globalBest: number[] = [];
  private globalBestFitness: number = Infinity;
  private convergenceHistory: number[] = [];
  private distanceMatrix: number[][] = [];
  private random: () => number;
  private warehouseIdx: number; // Cache warehouse index
  private currentIteration: number = 0;
  private stagnationCounter: number = 0;
  private lastBestFitness: number = Infinity;
  
  // Adaptive parameters
  private initialInertia: number;
  private finalInertia: number = 0.4;

  constructor(points: Point[], config: PSOConfig) {
    this.points = points;
    this.config = {
      mutationRate: 0.02,
      adaptiveInertia: true,
      use2OptMutation: true,
      stagnationThreshold: 20,
      ...config
    };
    
    this.initialInertia = config.inertiaWeight;
    
    // Simple LCG random number generator for reproducibility
    if (config.randomSeed !== undefined) {
      let seed = config.randomSeed;
      this.random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    } else {
      this.random = Math.random;
    }

    // Cache warehouse index once
    this.warehouseIdx = this.points.findIndex(p => p.isWarehouse);
    if (this.warehouseIdx === -1) this.warehouseIdx = 0; // Fallback to first point

    this.precomputeDistances();
    this.initializeSwarm();
  }

  private precomputeDistances(): void {
    const n = this.points.length;
    this.distanceMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = this.calculateDistance(this.points[i], this.points[j]);
        this.distanceMatrix[i][j] = dist;
        this.distanceMatrix[j][i] = dist;
      }
    }
  }

  private calculateDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private initializeSwarm(): void {
    const numPoints = this.points.length;
    
    for (let i = 0; i < this.config.swarmSize; i++) {
      // Create random route (excluding warehouse as it's fixed start/end)
      const route = Array.from({ length: numPoints }, (_, idx) => idx)
        .filter(idx => idx !== this.warehouseIdx);
      
      // Shuffle using Fisher-Yates
      for (let j = route.length - 1; j > 0; j--) {
        const k = Math.floor(this.random() * (j + 1));
        [route[j], route[k]] = [route[k], route[j]];
      }

      const fitness = this.calculateRouteFitness(route);
      
      const particle: Particle = {
        position: [...route],
        velocity: this.generateRandomSwapSequence(route.length, 3), // Initial velocity
        personalBest: [...route],
        personalBestFitness: fitness,
        currentFitness: fitness,
        stagnationCounter: 0,
      };

      this.particles.push(particle);

      if (fitness < this.globalBestFitness) {
        this.globalBestFitness = fitness;
        this.globalBest = [...route];
      }
    }

    this.convergenceHistory.push(this.globalBestFitness);
    this.lastBestFitness = this.globalBestFitness;
  }

  private generateRandomSwapSequence(routeLength: number, count: number): SwapOperation[] {
    const swaps: SwapOperation[] = [];
    for (let k = 0; k < count; k++) {
      const i = Math.floor(this.random() * routeLength);
      const j = Math.floor(this.random() * routeLength);
      if (i !== j) {
        swaps.push({ i, j, weight: this.random() });
      }
    }
    return swaps;
  }

  private calculateRouteFitness(route: number[]): number {
    let totalDistance = 0;
    
    // Distance from warehouse to first point
    if (route.length > 0) {
      totalDistance += this.distanceMatrix[this.warehouseIdx][route[0]];
    }
    
    // Distance between consecutive points
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += this.distanceMatrix[route[i]][route[i + 1]];
    }
    
    // Distance from last point back to warehouse
    if (route.length > 0) {
      totalDistance += this.distanceMatrix[route[route.length - 1]][this.warehouseIdx];
    }
    
    return totalDistance;
  }

  // Generate swap sequence to transform route1 into route2
  private generateSwapSequence(route1: number[], route2: number[]): SwapOperation[] {
    const swaps: SwapOperation[] = [];
    const tempRoute = [...route1];
    
    for (let i = 0; i < tempRoute.length; i++) {
      if (tempRoute[i] !== route2[i]) {
        // Find where route2[i] is in tempRoute
        const j = tempRoute.indexOf(route2[i]);
        if (j !== -1 && j !== i) {
          swaps.push({ i, j, weight: 1.0 });
          // Apply swap to tempRoute
          [tempRoute[i], tempRoute[j]] = [tempRoute[j], tempRoute[i]];
        }
      }
    }
    
    return swaps;
  }

  // Combine swap sequences with weights (discrete PSO velocity update)
  private combineSwapSequences(
    current: SwapOperation[],
    cognitive: SwapOperation[],
    social: SwapOperation[],
    w: number,
    c1: number,
    c2: number
  ): SwapOperation[] {
    const combined = new Map<string, SwapOperation>();
    
    // Add current velocity with inertia weight
    current.forEach(swap => {
      const key = `${swap.i}-${swap.j}`;
      combined.set(key, { ...swap, weight: swap.weight * w });
    });
    
    // Add cognitive component
    const r1 = this.random();
    cognitive.forEach(swap => {
      const key = `${swap.i}-${swap.j}`;
      const existing = combined.get(key);
      if (existing) {
        existing.weight += swap.weight * c1 * r1;
      } else {
        combined.set(key, { ...swap, weight: swap.weight * c1 * r1 });
      }
    });
    
    // Add social component
    const r2 = this.random();
    social.forEach(swap => {
      const key = `${swap.i}-${swap.j}`;
      const existing = combined.get(key);
      if (existing) {
        existing.weight += swap.weight * c2 * r2;
      } else {
        combined.set(key, { ...swap, weight: swap.weight * c2 * r2 });
      }
    });
    
    // Convert to array and sort by weight (highest first)
    const result = Array.from(combined.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, this.config.velocityClamp); // Clamp velocity
    
    return result;
  }

  // Apply swap sequence to position (guided by velocity)
  private applySwapSequence(position: number[], swaps: SwapOperation[]): number[] {
    const newPosition = [...position];
    
    // Apply top swaps based on their weights
    swaps.forEach(swap => {
      if (this.random() < swap.weight) { // Probabilistic application
        if (swap.i < newPosition.length && swap.j < newPosition.length) {
          [newPosition[swap.i], newPosition[swap.j]] = 
          [newPosition[swap.j], newPosition[swap.i]];
        }
      }
    });
    
    return newPosition;
  }

  // 2-opt local search mutation
  private apply2OptMutation(route: number[]): number[] {
    const n = route.length;
    if (n < 4) return route; // Need at least 4 nodes for 2-opt
    
    let improved = true;
    let newRoute = [...route];
    let iterations = 0;
    const maxIterations = Math.min(n * n, 100); // Limit for performance
    
    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      
      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 2; j < n; j++) {
          // Calculate current distance
          const curr1 = i === 0 ? this.warehouseIdx : newRoute[i - 1];
          const curr2 = newRoute[i];
          const curr3 = newRoute[j];
          const curr4 = j === n - 1 ? this.warehouseIdx : newRoute[j + 1];
          
          const currentDist = this.distanceMatrix[curr1][curr2] + 
                             this.distanceMatrix[curr3][curr4];
          
          // Calculate new distance after reversing segment
          const newDist = this.distanceMatrix[curr1][curr3] + 
                         this.distanceMatrix[curr2][curr4];
          
          if (newDist < currentDist - 0.001) { // Small epsilon for floating point
            // Reverse segment [i, j]
            this.reverseSegment(newRoute, i, j);
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }
    
    return newRoute;
  }

  private reverseSegment(route: number[], i: number, j: number): void {
    while (i < j) {
      [route[i], route[j]] = [route[j], route[i]];
      i++;
      j--;
    }
  }

  // Simple swap mutation
  private applySwapMutation(route: number[]): number[] {
    const newRoute = [...route];
    const i = Math.floor(this.random() * newRoute.length);
    const j = Math.floor(this.random() * newRoute.length);
    [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
    return newRoute;
  }

  // Get adaptive inertia weight
  private getAdaptiveInertia(): number {
    if (!this.config.adaptiveInertia) {
      return this.config.inertiaWeight;
    }
    
    const progress = this.currentIteration / this.config.iterations;
    return this.initialInertia - (this.initialInertia - this.finalInertia) * progress;
  }

  public step(): PSOResult {
    this.currentIteration++;
    const currentInertia = this.getAdaptiveInertia();
    const { cognitiveCoeff, socialCoeff } = this.config;

    // Check for global stagnation
    if (Math.abs(this.globalBestFitness - this.lastBestFitness) < 0.001) {
      this.stagnationCounter++;
    } else {
      this.stagnationCounter = 0;
      this.lastBestFitness = this.globalBestFitness;
    }

    // Handle stagnation - reinitialize some particles
    if (this.stagnationCounter > (this.config.stagnationThreshold || 20)) {
      const reinitCount = Math.floor(this.config.swarmSize * 0.3); // Reinit 30%
      for (let i = 0; i < reinitCount; i++) {
        const particle = this.particles[i];
        const route = [...particle.position];
        
        // Shuffle route
        for (let j = route.length - 1; j > 0; j--) {
          const k = Math.floor(this.random() * (j + 1));
          [route[j], route[k]] = [route[k], route[j]];
        }
        
        particle.position = route;
        particle.velocity = this.generateRandomSwapSequence(route.length, 5);
        particle.stagnationCounter = 0;
      }
      this.stagnationCounter = 0;
    }

    for (const particle of this.particles) {
      // Generate swap sequences (discrete PSO)
      const cognitiveSwaps = this.generateSwapSequence(particle.position, particle.personalBest);
      const socialSwaps = this.generateSwapSequence(particle.position, this.globalBest);
      
      // Update velocity (discrete)
      particle.velocity = this.combineSwapSequences(
        particle.velocity,
        cognitiveSwaps,
        socialSwaps,
        currentInertia,
        cognitiveCoeff,
        socialCoeff
      );

      // Update position
      let newPosition = this.applySwapSequence(particle.position, particle.velocity);
      
      // Apply mutation
      if (this.random() < (this.config.mutationRate || 0.02)) {
        if (this.config.use2OptMutation && this.random() < 0.7) {
          newPosition = this.apply2OptMutation(newPosition);
        } else {
          newPosition = this.applySwapMutation(newPosition);
        }
      }
      
      particle.position = newPosition;

      // Evaluate fitness
      particle.currentFitness = this.calculateRouteFitness(particle.position);

      // Update personal best
      if (particle.currentFitness < particle.personalBestFitness) {
        particle.personalBestFitness = particle.currentFitness;
        particle.personalBest = [...particle.position];
        particle.stagnationCounter = 0;
      } else {
        particle.stagnationCounter++;
      }

      // Update global best
      if (particle.currentFitness < this.globalBestFitness) {
        this.globalBestFitness = particle.currentFitness;
        this.globalBest = [...particle.position];
      }
      
      // Individual particle stagnation - apply local mutation
      if (particle.stagnationCounter > 10) {
        particle.position = this.applySwapMutation(particle.position);
        particle.stagnationCounter = 0;
      }
    }

    this.convergenceHistory.push(this.globalBestFitness);

    return this.getResult();
  }

  public getResult(): PSOResult {
    return {
      globalBest: [...this.globalBest],
      globalBestFitness: this.globalBestFitness,
      iteration: this.convergenceHistory.length - 1,
      particles: this.particles.map(p => ({
        position: [...p.position],
        velocity: p.velocity.map(v => ({ ...v })),
        personalBest: [...p.personalBest],
        personalBestFitness: p.personalBestFitness,
        currentFitness: p.currentFitness,
        stagnationCounter: p.stagnationCounter,
      })),
      convergenceHistory: [...this.convergenceHistory],
    };
  }

  public getBestRoute(): number[] {
    return [this.warehouseIdx, ...this.globalBest, this.warehouseIdx];
  }

  public getSwarmDiversity(): number {
    if (this.particles.length === 0) return 0;
    
    let totalDiversity = 0;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        let differences = 0;
        for (let k = 0; k < this.particles[i].position.length; k++) {
          if (this.particles[i].position[k] !== this.particles[j].position[k]) {
            differences++;
          }
        }
        totalDiversity += differences / this.particles[i].position.length;
      }
    }
    
    const pairCount = (this.particles.length * (this.particles.length - 1)) / 2;
    return pairCount > 0 ? totalDiversity / pairCount : 0;
  }
  
  // Additional utility method for warm-starting when points are added
  public addPoint(point: Point): void {
    this.points.push(point);
    this.precomputeDistances();
    
    // Update all particle positions to include new point
    const newPointIdx = this.points.length - 1;
    if (newPointIdx !== this.warehouseIdx) {
      this.particles.forEach(particle => {
        // Insert new point at random position
        const insertPos = Math.floor(this.random() * (particle.position.length + 1));
        particle.position.splice(insertPos, 0, newPointIdx);
        particle.personalBest.splice(insertPos, 0, newPointIdx);
        
        // Re-evaluate fitness
        particle.currentFitness = this.calculateRouteFitness(particle.position);
        particle.personalBestFitness = this.calculateRouteFitness(particle.personalBest);
      });
      
      // Update global best
      const insertPos = Math.floor(this.random() * (this.globalBest.length + 1));
      this.globalBest.splice(insertPos, 0, newPointIdx);
      this.globalBestFitness = this.calculateRouteFitness(this.globalBest);
    }
  }
}
