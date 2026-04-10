/**
 * Componente de gráfico de linha mostrando atividades por hora.
 * Usa Recharts — biblioteca de gráficos baseada em D3 para React.
 *
 * useMemo é aplicado aqui para memoizar os dados formatados
 * para o Recharts, evitando recálculo a cada render.
 */
'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ActivityChartData } from '@/types';

interface ActivityChartProps {
  data: ActivityChartData[];
  title?: string;
  isRealTime?: boolean; // indica se está recebendo dados via subscription
}

export function ActivityChart({
  data,
  title = 'Atividades por Hora',
  isRealTime = false,
}: ActivityChartProps) {
  /**
   * useMemo: formata os dados para o Recharts apenas quando 'data' muda.
   * Embora este caso seja simples, em cenários com transformações complexas
   * (normalização, filtragem, cálculo de médias) o ganho é significativo.
   */
  const chartData = useMemo(() => {
    if (data.length === 0) {
      // Dados de exemplo quando não há dados reais (onboarding UX)
      return Array.from({ length: 8 }, (_, i) => ({
        time: `${String(i + 8).padStart(2, '0')}:00`,
        count: Math.floor(Math.random() * 20),
      }));
    }
    return data;
  }, [data]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
          {title}
        </h2>
        {/* Indicador de conexão ao vivo */}
        {isRealTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              animation: 'pulse 2s infinite',
            }} />
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Ao vivo</span>
          </div>
        )}
      </div>

      {/* ResponsiveContainer: adapta o gráfico ao tamanho do container pai */}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{ value: 'Eventos', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#f9fafb',
              fontSize: '13px',
            }}
            labelStyle={{ color: '#e5e7eb' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="Atividades"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6, fill: '#2563eb' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
