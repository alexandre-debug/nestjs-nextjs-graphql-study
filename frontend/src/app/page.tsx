/**
 * Dashboard principal — página de visão geral do monitoramento.
 *
 * Esta é a página raiz (/). Demonstra:
 * - useActivityData (custom hook com useMemo e useCallback)
 * - useRealTimeSubscription (dados ao vivo via WebSocket)
 * - StatsCard (React.memo)
 * - ActivityChart (Recharts + useMemo)
 * - ErrorBoundary envolvendo seções da página
 */
'use client';

import React, { useMemo } from 'react';
import { ActivityChart } from '@/components/Dashboard/ActivityChart';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { ActivityLogList } from '@/components/ActivityLog/ActivityLogList';
import { WithErrorBoundary } from '@/components/common/ErrorBoundary';
import { useActivityData } from '@/hooks/useActivityData';
import { useRealTimeSubscription } from '@/hooks/useRealTimeSubscription';
import { useAppState } from '@/context/AppContext';

export default function DashboardPage() {
  const { activities, chartData, actionCounts, loading } = useActivityData();
  const { latestActivity, isConnected } = useRealTimeSubscription({ enabled: true });
  const { hasUnreadActivities } = useAppState();

  /**
   * useMemo: calcula estatísticas de resumo do dashboard.
   * Deriva múltiplos valores de 'activities' em uma única passagem —
   * mais eficiente do que 3 useMemos separados.
   */
  const stats = useMemo(() => {
    const uniqueUsers = new Set(activities.map((a) => a.userId)).size;
    const suspiciousCount = activities.filter((a) =>
      ['FILE_DOWNLOAD_BULK', 'USB_DEVICE_CONNECTED', 'VPN_CONNECTED'].includes(a.action),
    ).length;
    const recentActivities = activities.filter((a) => {
      const oneHourAgo = Date.now() - 3600000;
      return new Date(a.timestamp).getTime() > oneHourAgo;
    }).length;

    return { uniqueUsers, suspiciousCount, recentActivities, total: activities.length };
  }, [activities]);

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700 }}>
            Dashboard de Monitoramento
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
            Visão geral das atividades dos funcionários em tempo real
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: isConnected ? '#22c55e' : '#9ca3af',
          }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {isConnected ? 'Conectado ao vivo' : 'Offline'}
          </span>
          {hasUnreadActivities && (
            <span style={{
              padding: '2px 8px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 600,
            }}>
              Novas atividades
            </span>
          )}
        </div>
      </div>

      {/* Cards de estatísticas */}
      {/* ErrorBoundary: se StatsCard lançar erro, só esta seção mostra fallback */}
      <WithErrorBoundary fallback={<div style={{ padding: 16, color: '#ef4444' }}>Erro ao carregar estatísticas</div>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatsCard
            title="Total de Eventos"
            value={loading ? '...' : stats.total}
            description="Últimas 24 horas"
            trend="up"
            trendValue="+12% vs ontem"
            color="#3b82f6"
          />
          <StatsCard
            title="Usuários Ativos"
            value={loading ? '...' : stats.uniqueUsers}
            description="Com atividade registrada"
            color="#8b5cf6"
          />
          <StatsCard
            title="Atividades Recentes"
            value={loading ? '...' : stats.recentActivities}
            description="Última hora"
            color="#10b981"
          />
          <StatsCard
            title="Alertas de Segurança"
            value={loading ? '...' : stats.suspiciousCount}
            description="Ações suspeitas detectadas"
            trend={stats.suspiciousCount > 0 ? 'up' : 'neutral'}
            trendValue={stats.suspiciousCount > 0 ? 'Verificar' : 'Nenhum'}
            color="#ef4444"
          />
        </div>
      </WithErrorBoundary>

      {/* Gráfico de atividades */}
      <WithErrorBoundary>
        <div style={{ marginBottom: 24 }}>
          <ActivityChart
            data={chartData}
            title="Atividades por Hora"
            isRealTime={isConnected}
          />
        </div>
      </WithErrorBoundary>

      {/* Atividade mais recente via subscription */}
      {latestActivity && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 13,
          color: '#1d4ed8',
        }}>
          🔔 <strong>Atividade mais recente:</strong> {latestActivity.action}{' '}
          — {new Date(latestActivity.timestamp).toLocaleTimeString('pt-BR')}
        </div>
      )}

      {/* Feed de atividades ao vivo */}
      <WithErrorBoundary>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>
            Feed de Atividades
          </h2>
          <ActivityLogList showRealTime />
        </div>
      </WithErrorBoundary>
    </div>
  );
}
