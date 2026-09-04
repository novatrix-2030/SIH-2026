'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function PlotlyTrendChart({ trends, onPointClick }) {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const isLight = theme === 'light';

  const labels = trends?.labels || ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const mockScores = trends?.mock_test_scores || [58.4, 63.8, 69.2, 74.5, 78.1, 82.6];
  const burnoutScores = trends?.burnout_scores || [32.0, 48.5, 62.0, 42.0, 38.5, 34.0];
  const attendanceRates = trends?.attendance || [76.5, 75.8, 74.2, 75.1, 75.6, 76.0];

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return;

    let timeoutId;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 30);
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  const plotData = [
    {
      x: labels,
      y: mockScores,
      name: 'Class 12 Mock Test Avg (%)',
      type: 'scatter',
      mode: 'lines+markers',
      fill: 'tozeroy',
      fillcolor: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 242, 254, 0.12)',
      line: { color: isLight ? '#0284c7' : '#00f2fe', width: 3, shape: 'spline' },
      marker: { size: 10, color: '#ffffff', line: { color: isLight ? '#0284c7' : '#00f2fe', width: 3 } },
      hovertemplate: '<b>%{x} 2026</b><br>Mock Test Avg: <b>%{y}%</b><extra></extra>',
    },
    {
      x: labels,
      y: burnoutScores,
      name: 'Burnout Velocity (%)',
      type: 'scatter',
      mode: 'lines+markers',
      fill: 'tozeroy',
      fillcolor: isLight ? 'rgba(124, 58, 237, 0.12)' : 'rgba(121, 40, 202, 0.12)',
      line: { color: isLight ? '#7c3aed' : '#7928ca', width: 3, shape: 'spline' },
      marker: { size: 10, color: '#ffffff', line: { color: isLight ? '#7c3aed' : '#7928ca', width: 3 } },
      hovertemplate: '<b>%{x} 2026</b><br>Burnout Index: <b>%{y}%</b><extra></extra>',
    },
    {
      x: labels,
      y: attendanceRates,
      name: 'Attendance Rate (%)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: isLight ? '#059669' : '#00f5a0', width: 2, dash: 'dash', shape: 'spline' },
      marker: { size: 7, color: isLight ? '#059669' : '#00f5a0' },
      hovertemplate: '<b>%{x} 2026</b><br>Attendance: <b>%{y}%</b><extra></extra>',
    },
  ];

  const plotLayout = {
    autosize: true,
    height: 250,
    margin: { l: 40, r: 20, t: 30, b: 40 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.18,
      font: { color: isLight ? '#334155' : '#94a3b8', size: 11 },
    },
    xaxis: {
      gridcolor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.04)',
      tickfont: { color: isLight ? '#475569' : '#94a3b8', size: 11 },
      showgrid: true,
    },
    yaxis: {
      range: [0, 100],
      gridcolor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.04)',
      tickfont: { color: isLight ? '#475569' : '#94a3b8', size: 11 },
      showgrid: true,
    },
    hoverlabel: {
      bgcolor: isLight ? '#ffffff' : '#0f172a',
      bordercolor: isLight ? '#0284c7' : '#00f2fe',
      font: { family: 'Inter, sans-serif', color: isLight ? '#0f172a' : '#ffffff' },
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  const handlePlotClick = (data) => {
    if (data?.points?.length > 0) {
      const pointIndex = data.points[0].pointIndex;
      if (onPointClick) {
        onPointClick(pointIndex);
      }
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: 250, cursor: 'pointer' }}>
      <Plot
        data={plotData}
        layout={plotLayout}
        config={config}
        onClick={handlePlotClick}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
