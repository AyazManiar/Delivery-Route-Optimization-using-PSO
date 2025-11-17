'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

interface ConvergenceGraphProps {
  convergenceHistory: number[];
  currentIteration: number;
  bestFitness: number;
}

export const ConvergenceGraph: React.FC<ConvergenceGraphProps> = ({
  convergenceHistory,
  currentIteration,
  bestFitness,
}) => {
  const data = convergenceHistory.map((fitness, iteration) => ({
    iteration,
    fitness: parseFloat(fitness.toFixed(2)),
  }));

  const exportAsPNG = () => {
    // Create a canvas for the export
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PSO Convergence Graph', 400, 40);
    
    // Draw axes
    const padding = 80;
    const graphWidth = 800 - 2 * padding;
    const graphHeight = 600 - 2 * padding;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, 600 - padding);
    ctx.lineTo(800 - padding, 600 - padding);
    ctx.stroke();
    
    // Draw data
    if (data.length > 0) {
      const maxFitness = Math.max(...data.map(d => d.fitness));
      const minFitness = Math.min(...data.map(d => d.fitness));
      const maxIteration = data.length - 1;
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      data.forEach((point, idx) => {
        const x = padding + (point.iteration / maxIteration) * graphWidth;
        const y = 600 - padding - ((point.fitness - minFitness) / (maxFitness - minFitness || 1)) * graphHeight;
        
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
    
    // Download
    const link = document.createElement('a');
    link.download = `pso-convergence-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Convergence Graph</h3>
        <button
          onClick={exportAsPNG}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Download size={16} />
          Export PNG
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Best Fitness</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {bestFitness.toFixed(2)}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Current Iteration</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {currentIteration}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700" style={{ height: '300px' }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="iteration" 
                stroke="#6b7280"
                label={{ value: 'Iteration', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#6b7280"
                label={{ value: 'Fitness (Distance)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="fitness" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start optimization to see convergence
          </div>
        )}
      </div>
    </div>
  );
};
