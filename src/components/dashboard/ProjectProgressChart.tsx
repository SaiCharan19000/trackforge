import React from 'react';
import { DashboardMetrics } from '../../types';

interface ProjectProgressChartProps {
  metrics: DashboardMetrics;
}

export const ProjectProgressChart: React.FC<ProjectProgressChartProps> = ({ metrics }) => {
  const { overallProgress, completedTasks, pendingTasks, totalTasks } = metrics;

  // SVG Circular Gauge calculation
  const radius = 64;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Task Completion Rate</h4>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Organization Health</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flex: 1, padding: '1rem 0' }}>
        {/* Circular Gauge */}
        <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
          <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              stroke="var(--bg-subtle)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="url(#progressGradient)"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary-500)" />
                <stop offset="100%" stopColor="var(--accent-cyan)" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {overallProgress}%
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Done
            </span>
          </div>
        </div>

        {/* Legend / Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              <span>Completed</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginLeft: '0.9rem', color: 'var(--text-primary)' }}>
              {completedTasks} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {totalTasks}</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-500)' }} />
              <span>In Progress / Pending</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginLeft: '0.9rem', color: 'var(--text-primary)' }}>
              {pendingTasks}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
