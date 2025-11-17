'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Point } from '@/lib/pso-engine';

// Fix for default marker icons in Next.js
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapVisualizationProps {
  points: Point[];
  globalBest: number[];
  showGlobalBest: boolean;
  className?: string;
}

// Convert canvas coordinates to lat/lon (simplified conversion)
const toLatLon = (point: Point): [number, number] => {
  if (point.lat !== undefined && point.lon !== undefined) {
    return [point.lat, point.lon];
  }
  
  // Simple conversion: scale to approximate lat/lon around a center point
  const centerLat = 40.7128; // New York City as default
  const centerLon = -74.0060;
  const scaleFactor = 0.001;
  
  return [
    centerLat + point.y * scaleFactor,
    centerLon + point.x * scaleFactor,
  ];
};

const MapUpdater: React.FC<{ points: Point[] }> = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points.length > 0) {
      const bounds = points.map(p => toLatLon(p)) as LatLngExpression[];
      map.fitBounds(bounds as any, { padding: [50, 50] });
    }
  }, [points, map]);
  
  return null;
};

export const MapVisualization: React.FC<MapVisualizationProps> = ({
  points,
  globalBest,
  showGlobalBest,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  const warehouseIdx = points.findIndex(p => p.isWarehouse);
  const center = points.length > 0 ? toLatLon(points[0]) : [40.7128, -74.0060] as [number, number];

  // Create warehouse icon
  const warehouseIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
        <text x="16" y="20" font-size="12" font-weight="bold" fill="white" text-anchor="middle">W</text>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const deliveryIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="#2563eb" stroke-width="2"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Build route polyline
  const routePositions: LatLngExpression[] = [];
  if (showGlobalBest && globalBest.length > 0 && warehouseIdx >= 0) {
    routePositions.push(toLatLon(points[warehouseIdx]));
    globalBest.forEach(idx => {
      if (idx >= 0 && idx < points.length) {
        routePositions.push(toLatLon(points[idx]));
      }
    });
    routePositions.push(toLatLon(points[warehouseIdx]));
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater points={points} />

        {/* Draw route */}
        {showGlobalBest && routePositions.length > 0 && (
          <Polyline
            positions={routePositions}
            color="#10b981"
            weight={4}
            opacity={0.8}
          />
        )}

        {/* Draw markers */}
        {points.map((point, idx) => {
          const position = toLatLon(point);
          const isWarehouse = point.isWarehouse;

          return (
            <Marker
              key={idx}
              position={position}
              icon={isWarehouse ? warehouseIcon : deliveryIcon}
            >
              <Popup>
                {isWarehouse ? (
                  <div className="font-bold text-red-600">
                    Warehouse (Start/End)
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold">Delivery Point #{idx}</div>
                    <div className="text-sm text-gray-600">
                      Coords: ({point.x.toFixed(1)}, {point.y.toFixed(1)})
                    </div>
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
