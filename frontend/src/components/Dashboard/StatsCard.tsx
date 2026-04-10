'use client';

import React, { memo } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

/**
 * React.memo: previne rerenders quando as props não mudam.
 * Útil para componentes "folha" que recebem dados do pai — se o pai
 * rerenderiza mas as props deste card não mudaram, o React pula o render.
 *
 * Quando NÃO usar: componentes que sempre recebem props diferentes,
 * ou componentes muito simples (o overhead do memo supera o benefício).
 */
export const StatsCard = memo(function StatsCard({
  title,
  value,
  description,
  trend = 'neutral',
  trendValue,
  color = '#3b82f6',
}: StatsCardProps) {
  const trendColors = { up: '#22c55e', down: '#ef4444', neutral: '#9ca3af' };
  const trendIcons = { up: '↑', down: '↓', neutral: '→' };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
    }}>
      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
        {title}
      </p>
      <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#111827' }}>
        {value}
      </p>
      {description && (
        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{description}</p>
      )}
      {trendValue && (
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: trendColors[trend], fontWeight: 500 }}>
          {trendIcons[trend]} {trendValue}
        </p>
      )}
    </div>
  );
});
