'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Map, Layers, Download, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { PSOEngine, Point, PSOConfig } from '@/lib/pso-engine';
import { CanvasVisualization } from '@/components/CanvasVisualization';
import { ControlPanel } from '@/components/ControlPanel';
import { ConvergenceGraph } from '@/components/ConvergenceGraph';
import { StatisticsPanel } from '@/components/StatisticsPanel';

// Dynamically import map to avoid SSR issues
const MapVisualization = dynamic(
  () => import('@/components/MapVisualization').then(mod => ({ default: mod.MapVisualization })),
  { ssr: false }
);

type ViewMode = 'canvas' | 'map';
type TabMode = 'controls' | 'graph' | 'stats';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [activeTab, setActiveTab] = useState<TabMode>('controls');
  const [leftPanelWidth, setLeftPanelWidth] = useState(30); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // PSO State
  const [points, setPoints] = useState<Point[]>([]);
  const [numPoints, setNumPoints] = useState(15);
  const [swarmSize, setSwarmSize] = useState(30);
  const [iterations, setIterations] = useState(200);
  const [inertiaWeight, setInertiaWeight] = useState(0.7);
  const [cognitiveCoeff, setCognitiveCoeff] = useState(1.5);
  const [socialCoeff, setSocialCoeff] = useState(1.5);
  const [velocityClamp, setVelocityClamp] = useState(5);
  const [randomSeed, setRandomSeed] = useState('');
  const [showParticles, setShowParticles] = useState(true);
  const [showGlobalBest, setShowGlobalBest] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Results
  const [globalBest, setGlobalBest] = useState<number[]>([]);
  const [globalBestFitness, setGlobalBestFitness] = useState(Infinity);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [convergenceHistory, setConvergenceHistory] = useState<number[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [swarmDiversity, setSwarmDiversity] = useState(0);
  const [totalRuntime, setTotalRuntime] = useState(0);
  const [fps, setFps] = useState(60);

  const psoEngineRef = useRef<PSOEngine | null>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Generate random points
  const generatePoints = useCallback(() => {
    const newPoints: Point[] = [];
    
    // Add warehouse (start/end point)
    newPoints.push({
      x: 50,
      y: 50,
      isWarehouse: true,
    });

    // Add random delivery points
    for (let i = 0; i < numPoints; i++) {
      newPoints.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        isWarehouse: false,
      });
    }

    setPoints(newPoints);
    setGlobalBest([]);
    setConvergenceHistory([]);
    setCurrentIteration(0);
    setGlobalBestFitness(Infinity);
    setParticles([]);
  }, [numPoints]);

  // Initialize with random points
  useEffect(() => {
    generatePoints();
  }, []);

  // Start optimization
  const handleStart = useCallback(() => {
    if (points.length < 2) {
      alert('Please generate points first!');
      return;
    }

    // Close mobile menu when starting optimization
    setMobileMenuOpen(false);

    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      return;
    }

    const config: PSOConfig = {
      swarmSize,
      iterations,
      inertiaWeight,
      cognitiveCoeff,
      socialCoeff,
      velocityClamp,
      randomSeed: randomSeed ? parseInt(randomSeed) : undefined,
    };

    psoEngineRef.current = new PSOEngine(points, config);
    const initialResult = psoEngineRef.current.getResult();
    
    setGlobalBest(initialResult.globalBest);
    setGlobalBestFitness(initialResult.globalBestFitness);
    setConvergenceHistory(initialResult.convergenceHistory);
    setParticles(initialResult.particles);
    setCurrentIteration(0);
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
  }, [points, swarmSize, iterations, inertiaWeight, cognitiveCoeff, socialCoeff, velocityClamp, randomSeed, isPaused]);

  // Pause optimization
  const handlePause = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  // Reset simulation
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setGlobalBest([]);
    setGlobalBestFitness(Infinity);
    setConvergenceHistory([]);
    setCurrentIteration(0);
    setParticles([]);
    setTotalRuntime(0);
    psoEngineRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // PSO optimization loop
  useEffect(() => {
    if (!isRunning || isPaused || !psoEngineRef.current) return;

    const runStep = () => {
      if (!psoEngineRef.current) return;

      const result = psoEngineRef.current.step();
      setGlobalBest(result.globalBest);
      setGlobalBestFitness(result.globalBestFitness);
      setConvergenceHistory(result.convergenceHistory);
      setParticles(result.particles);
      setCurrentIteration(result.iteration);
      setSwarmDiversity(psoEngineRef.current.getSwarmDiversity());
      setTotalRuntime(Date.now() - startTimeRef.current);

      if (result.iteration < iterations) {
        setTimeout(() => {
          if (isRunning && !isPaused) {
            runStep();
          }
        }, 100 / animationSpeed);
      } else {
        setIsRunning(false);
      }
    };

    runStep();
  }, [isRunning, isPaused, iterations, animationSpeed]);

  // Export route as JSON
  const exportRoute = useCallback(() => {
    const warehouseIdx = points.findIndex(p => p.isWarehouse);
    const fullRoute = [warehouseIdx, ...globalBest, warehouseIdx];
    
    const exportData = {
      route: fullRoute,
      totalDistance: globalBestFitness,
      points: points,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `route-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [points, globalBest, globalBestFitness]);

  // Save to localStorage
  useEffect(() => {
    const state = {
      points,
      globalBest,
      globalBestFitness,
      convergenceHistory,
      currentIteration,
    };
    localStorage.setItem('pso-session', JSON.stringify(state));
  }, [points, globalBest, globalBestFitness, convergenceHistory, currentIteration]);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Panel resize handling
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    setLeftPanelWidth(Math.min(Math.max(newWidth, 20), 50));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const bestRoute = globalBest.length > 0 
    ? [points.findIndex(p => p.isWarehouse), ...globalBest, points.findIndex(p => p.isWarehouse)]
    : [];

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Layers className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-bold text-gray-800 dark:text-gray-100">RoutePSO</h1>
            <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">Dynamic Delivery Route Optimization</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Export Button - Icon only on mobile */}
          <button
            onClick={exportRoute}
            disabled={globalBest.length === 0}
            className="p-2 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            title="Export Route"
          >
            <Download size={18} />
            <span className="hidden md:inline">Export Route</span>
          </button>

          {/* View Toggle - Hidden on mobile */}
          <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'canvas'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Layers size={18} />
              Canvas
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Map size={18} />
              Map
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-gray-600" size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[1000] lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Left Panel - Drawer on mobile, sidebar on desktop */}
        <div
          className={`fixed lg:relative z-[1001] lg:z-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg transition-transform duration-300 inset-y-0 left-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ 
            width: isMobile ? '85vw' : `${leftPanelWidth}%`, 
            maxWidth: isMobile ? '400px' : 'none'
          }}
        >
          {/* Mobile View Mode Toggle */}
          <div className="lg:hidden flex bg-gray-100 dark:bg-gray-700 p-2 gap-2 border-b border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'canvas' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'
              }`}
            >
              <Map className="inline-block mr-1" size={16} />
              Map
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'controls', label: 'Controls' },
              { id: 'graph', label: 'Convergence' },
              { id: 'stats', label: 'Statistics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`flex-1 px-2 md:px-4 py-3 text-xs md:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-6 lg:pb-0">
            <AnimatePresence mode="wait">
              {activeTab === 'controls' && (
                <motion.div
                  key="controls"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ControlPanel
                    numPoints={numPoints}
                    onNumPointsChange={setNumPoints}
                    onGeneratePoints={generatePoints}
                    swarmSize={swarmSize}
                    onSwarmSizeChange={setSwarmSize}
                    iterations={iterations}
                    onIterationsChange={setIterations}
                    inertiaWeight={inertiaWeight}
                    onInertiaWeightChange={setInertiaWeight}
                    cognitiveCoeff={cognitiveCoeff}
                    onCognitiveCoeffChange={setCognitiveCoeff}
                    socialCoeff={socialCoeff}
                    onSocialCoeffChange={setSocialCoeff}
                    velocityClamp={velocityClamp}
                    onVelocityClampChange={setVelocityClamp}
                    randomSeed={randomSeed}
                    onRandomSeedChange={setRandomSeed}
                    showParticles={showParticles}
                    onShowParticlesChange={setShowParticles}
                    showGlobalBest={showGlobalBest}
                    onShowGlobalBestChange={setShowGlobalBest}
                    animationSpeed={animationSpeed}
                    onAnimationSpeedChange={setAnimationSpeed}
                    onStart={handleStart}
                    onPause={handlePause}
                    onReset={handleReset}
                    isRunning={isRunning}
                    isPaused={isPaused}
                  />
                </motion.div>
              )}
              {activeTab === 'graph' && (
                <motion.div
                  key="graph"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ConvergenceGraph
                    convergenceHistory={convergenceHistory}
                    currentIteration={currentIteration}
                    bestFitness={globalBestFitness}
                  />
                </motion.div>
              )}
              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <StatisticsPanel
                    globalBestDistance={globalBestFitness}
                    currentIteration={currentIteration}
                    totalRuntime={totalRuntime}
                    bestRoute={bestRoute}
                    swarmDiversity={swarmDiversity}
                    fps={fps}
                    points={points}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Resizer - Hidden on mobile */}
        <div
          className="hidden lg:block w-1 bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Right Panel - Visualization */}
        <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
          {viewMode === 'canvas' ? (
            <CanvasVisualization
              points={points}
              particles={particles}
              globalBest={globalBest}
              showParticles={showParticles}
              showGlobalBest={showGlobalBest}
              animationSpeed={animationSpeed}
              isPlaying={isRunning && !isPaused}
            />
          ) : (
            <MapVisualization
              points={points}
              globalBest={globalBest}
              showGlobalBest={showGlobalBest}
            />
          )}

          {/* Status Badge */}
          {isRunning && !isPaused && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Optimizing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
