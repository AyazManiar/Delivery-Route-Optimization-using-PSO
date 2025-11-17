import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RoutePSO - Dynamic Delivery Route Optimization',
  description: 'Particle Swarm Optimization for route planning with real-time visualization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
