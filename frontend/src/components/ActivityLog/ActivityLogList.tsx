/**
 * Lista de logs de atividade com suporte a subscription em tempo real.
 * Combina dados históricos (useQuery) com dados ao vivo (useSubscription).
 */
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACTIVITY_LOGS } from '@/graphql/queries/activities';
import { useRealTimeSubscription } from '@/hooks/useRealTimeSubscription';
import { ActivityLog } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const ACTION_ICONS: Record<string, string> = {
  WEBSITE_VISIT: '🌐',
  APP_USAGE: '💻',
  FILE_ACCESS: '📁',
  FILE_DOWNLOAD_BULK: '⚠️',
  SCREENSHOT: '📷',
  IDLE: '💤',
  LOGIN: '🔑',
  LOGOUT: '🚪',
  USB_DEVICE_CONNECTED: '🔌',
  VPN_CONNECTED: '🔒',
};

const SUSPICIOUS_ACTIONS = ['FILE_DOWNLOAD_BULK', 'USB_DEVICE_CONNECTED', 'VPN_CONNECTED'];

interface ActivityLogListProps {
  userId?: string; // Se fornecido, filtra pelo usuário
  showRealTime?: boolean;
}

export function ActivityLogList({ userId, showRealTime = true }: ActivityLogListProps) {
  // Estado local para controlar o filtro de ação
  const [actionFilter, setActionFilter] = useState('');
  // Controla se a subscription em tempo real está ativa
  const [isSubscribed, setIsSubscribed] = useState(showRealTime);
  // Logs recebidos em tempo real (adicionados ao topo da lista)
  const [realtimeLogs, setRealtimeLogs] = useState<ActivityLog[]>([]);

  const filters = {
    ...(userId && { userId }),
    ...(actionFilter && { action: actionFilter }),
  };

  const { data, loading, error } = useQuery(GET_ACTIVITY_LOGS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network',
  });

  /**
   * useCallback: handler para nova atividade recebida via subscription.
   * Memoizado para não recriar a cada render — é passado para useRealTimeSubscription
   * que poderia causar o hook a re-executar sem necessidade se a referência mudasse.
   */
  const handleNewActivity = useCallback((activity: ActivityLog) => {
    // Adiciona ao topo da lista em tempo real
    setRealtimeLogs((prev) => [activity, ...prev].slice(0, 20));
  }, []);

  const { isConnected } = useRealTimeSubscription({
    onNewActivity: handleNewActivity,
    enabled: isSubscribed,
  });

  // Combina logs históricos com logs em tempo real
  const allLogs: ActivityLog[] = useMemo(() => {
    const historical = data?.activityLogs || [];

    // Evita duplicatas: exclui logs históricos que já estão no buffer em tempo real
    const realtimeIds = new Set(realtimeLogs.map((l) => l.id));
    const uniqueHistorical = historical.filter((l: ActivityLog) => !realtimeIds.has(l.id));

    return [...realtimeLogs, ...uniqueHistorical];
  }, [data?.activityLogs, realtimeLogs]);

  if (loading && allLogs.length === 0) return <LoadingSpinner message="Carregando logs..." />;
  if (error) return <div style={{ color: '#ef4444', padding: 16 }}>Erro: {error.message}</div>;

  return (
    <div>
      {/* Barra de controles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
          >
            <option value="">Todas as ações</option>
            <option value="WEBSITE_VISIT">Website Visit</option>
            <option value="APP_USAGE">App Usage</option>
            <option value="FILE_ACCESS">File Access</option>
            <option value="IDLE">Idle</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>

          {realtimeLogs.length > 0 && (
            <button
              onClick={() => setRealtimeLogs([])}
              style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'white' }}
            >
              Limpar novos ({realtimeLogs.length})
            </button>
          )}
        </div>

        {/* Toggle de subscription em tempo real */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: isConnected ? '#22c55e' : '#9ca3af',
          }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {isConnected ? 'Ao vivo' : 'Pausado'}
          </span>
          <button
            onClick={() => setIsSubscribed((v) => !v)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              fontSize: 12,
              background: isSubscribed ? '#fef2f2' : '#f0fdf4',
              color: isSubscribed ? '#ef4444' : '#16a34a',
            }}
          >
            {isSubscribed ? 'Pausar' : 'Retomar'}
          </button>
        </div>
      </div>

      {/* Lista de logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {allLogs.map((log, index) => {
          const isNew = index < realtimeLogs.length;
          const isSuspicious = SUSPICIOUS_ACTIONS.includes(log.action);

          return (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                backgroundColor: isSuspicious
                  ? '#fef2f2'
                  : isNew
                  ? '#eff6ff'
                  : '#ffffff',
                border: `1px solid ${isSuspicious ? '#fca5a5' : isNew ? '#bfdbfe' : '#f3f4f6'}`,
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>
                {ACTION_ICONS[log.action] || '📋'}
              </span>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: isSuspicious ? '#dc2626' : '#111827' }}>
                    {log.action.replace(/_/g, ' ')}
                    {isSuspicious && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: '#dc2626', fontWeight: 400 }}>
                        ⚠ Ação suspeita
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>

                {log.user && (
                  <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                    {log.user.name} · {log.user.email}
                  </p>
                )}

                {log.metadata && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ fontSize: 11, color: '#9ca3af', cursor: 'pointer' }}>
                      Metadados
                    </summary>
                    <pre style={{ fontSize: 11, color: '#6b7280', marginTop: 4, overflow: 'auto' }}>
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>

              {isNew && (
                <span style={{
                  padding: '2px 6px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 600,
                  flexShrink: 0,
                }}>
                  NOVO
                </span>
              )}
            </div>
          );
        })}

        {allLogs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
            <p>Nenhuma atividade registrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
