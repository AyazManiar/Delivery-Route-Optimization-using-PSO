'use client';

import React from 'react';
import { Sliders, Play, Pause, RotateCcw, Download, Eye, EyeOff } from 'lucide-react';

interface ControlPanelProps {
  numPoints: number;
  onNumPointsChange: (value: number) => void;
  onGeneratePoints: () => void;
  swarmSize: number;
  onSwarmSizeChange: (value: number) => void;
  iterations: number;
  onIterationsChange: (value: number) => void;
  inertiaWeight: number;
  onInertiaWeightChange: (value: number) => void;
  cognitiveCoeff: number;
  onCognitiveCoeffChange: (value: number) => void;
  socialCoeff: number;
  onSocialCoeffChange: (value: number) => void;
  velocityClamp: number;
  onVelocityClampChange: (value: number) => void;
  randomSeed: string;
  onRandomSeedChange: (value: string) => void;
  showParticles: boolean;
  onShowParticlesChange: (value: boolean) => void;
  showGlobalBest: boolean;
  onShowGlobalBestChange: (value: boolean) => void;
  animationSpeed: number;
  onAnimationSpeedChange: (value: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  isRunning: boolean;
  isPaused: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  numPoints,
  onNumPointsChange,
  onGeneratePoints,
  swarmSize,
  onSwarmSizeChange,
  iterations,
  onIterationsChange,
  inertiaWeight,
  onInertiaWeightChange,
  cognitiveCoeff,
  onCognitiveCoeffChange,
  socialCoeff,
  onSocialCoeffChange,
  velocityClamp,
  onVelocityClampChange,
  randomSeed,
  onRandomSeedChange,
  showParticles,
  onShowParticlesChange,
  showGlobalBest,
  onShowGlobalBestChange,
  animationSpeed,
  onAnimationSpeedChange,
  onStart,
  onPause,
  onReset,
  isRunning,
  isPaused,
}) => {
  return (
    <div className="space-y-6 p-6">
      {/* Point Generation */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Point Generation</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Delivery Points: {numPoints}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={numPoints}
            onChange={(e) => onNumPointsChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <button
          onClick={onGeneratePoints}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Sliders size={18} />
          Generate Random Points
        </button>
      </div>

      {/* PSO Parameters */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">PSO Parameters</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Swarm Size: {swarmSize}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={swarmSize}
            onChange={(e) => onSwarmSizeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Iterations: {iterations}
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={iterations}
            onChange={(e) => onIterationsChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Inertia Weight (w): {inertiaWeight.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={inertiaWeight}
            onChange={(e) => onInertiaWeightChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cognitive Coefficient (c1): {cognitiveCoeff.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="4"
            step="0.1"
            value={cognitiveCoeff}
            onChange={(e) => onCognitiveCoeffChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Social Coefficient (c2): {socialCoeff.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="4"
            step="0.1"
            value={socialCoeff}
            onChange={(e) => onSocialCoeffChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Velocity Clamp: {velocityClamp.toFixed(1)}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={velocityClamp}
            onChange={(e) => onVelocityClampChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Random Seed (optional)
          </label>
          <input
            type="text"
            value={randomSeed}
            onChange={(e) => onRandomSeedChange(e.target.value)}
            placeholder="Leave empty for random"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Visualization Options */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Visualization</h3>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Particles</span>
          <button
            onClick={() => onShowParticlesChange(!showParticles)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showParticles ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showParticles ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Global Best Path</span>
          <button
            onClick={() => onShowGlobalBestChange(!showGlobalBest)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showGlobalBest ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showGlobalBest ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Animation Speed: {animationSpeed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => onAnimationSpeedChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-2">
        <button
          onClick={isRunning && !isPaused ? onPause : onStart}
          className={`w-full px-4 py-3 ${
            isRunning && !isPaused ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
          } text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold`}
        >
          {isRunning && !isPaused ? (
            <>
              <Pause size={20} />
              Pause Optimization
            </>
          ) : (
            <>
              <Play size={20} />
              {isPaused ? 'Resume' : 'Start'} Optimization
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
        >
          <RotateCcw size={20} />
          Reset Simulation
        </button>
      </div>
    </div>
  );
};
