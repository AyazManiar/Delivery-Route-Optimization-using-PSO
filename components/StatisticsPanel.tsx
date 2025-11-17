'use client';

import React from 'react';
import { TrendingDown, Clock, Zap, Activity, GitBranch, Gauge } from 'lucide-react';

interface StatisticsPanelProps {
  globalBestDistance: number;
  currentIteration: number;
  totalRuntime: number;
  bestRoute: number[];
  swarmDiversity: number;
  fps: number;
  points: any[];
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  globalBestDistance,
  currentIteration,
  totalRuntime,
  bestRoute,
  swarmDiversity,
  fps,
  points,
}) => {
  const formatRoute = (route: number[]) => {
    if (route.length === 0) return 'N/A';
    return route.slice(0, 10).join(' → ') + (route.length > 10 ? ' ...' : '');
  };

  const stats = [
    {
      icon: TrendingDown,
      label: 'Global Best Distance',
      value: globalBestDistance.toFixed(2),
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Activity,
      label: 'Current Iteration',
      value: currentIteration.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Clock,
      label: 'Total Runtime',
      value: `${totalRuntime.toFixed(0)} ms`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: GitBranch,
      label: 'Swarm Diversity',
      value: (swarmDiversity * 100).toFixed(1) + '%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      icon: Zap,
      label: 'Delivery Points',
      value: points.length.toString(),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      icon: Gauge,
      label: 'Frame Rate',
      value: `${fps} FPS`,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Performance Statistics</h3>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bgColor} p-4 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={stat.color} size={18} />
              <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Best Route Found</div>
        <div className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
          {formatRoute(bestRoute)}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Optimization Progress</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          The PSO algorithm has explored <span className="font-bold">{currentIteration}</span> iterations,
          finding an optimized route with a total distance of <span className="font-bold">{globalBestDistance.toFixed(2)}</span> units.
        </div>
      </div>
    </div>
  );
};
