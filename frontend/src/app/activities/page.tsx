/**
 * Página de Logs de Atividade.
 *
 * Demonstra:
 * - ActivityLogList com subscription em tempo real
 * - Filtros controlados via Context
 * - useDebounce para evitar queries excessivas
 */
'use client';

import React, { useState } from 'react';
import { ActivityLogList } from '@/components/ActivityLog/ActivityLogList';
import { WithErrorBoundary } from '@/components/common/ErrorBoundary';
import { useAppState, useAppActions } from '@/context/AppContext';
import { useMutation } from '@apollo/client';
import { CREATE_ACTIVITY_LOG } from '@/graphql/mutations/activities';
import { GET_ACTIVITY_LOGS } from '@/graphql/queries/activities';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '@/graphql/queries/users';

export default function ActivitiesPage() {
  const { activityFilters } = useAppState();
  const { setActivityFilters, resetFilters } = useAppActions();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700 }}>
          Logs de Atividade
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
          Histórico completo de atividades monitoradas com filtros avançados
        </p>
      </div>

      {/* Simulador de eventos — para demonstração em entrevista */}
      <WithErrorBoundary>
        <ActivitySimulator />
      </WithErrorBoundary>

      {/* Feed de atividades com subscription */}
      <WithErrorBoundary>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <ActivityLogList showRealTime userId={activityFilters.userId} />
        </div>
      </WithErrorBoundary>
    </div>
  );
}

/**
 * Componente auxiliar para simular eventos de atividade.
 * Permite demonstrar as subscriptions ao vivo durante a entrevista
 * sem precisar de agentes externos gerando dados.
 */
function ActivitySimulator() {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedAction, setSelectedAction] = useState('WEBSITE_VISIT');
  const [message, setMessage] = useState('');

  const { data: usersData } = useQuery(GET_USERS);

  const [createActivityLog, { loading }] = useMutation(CREATE_ACTIVITY_LOG, {
    refetchQueries: [{ query: GET_ACTIVITY_LOGS, variables: { filters: {} } }],
  });

  const SAMPLE_ACTIONS = [
    'WEBSITE_VISIT', 'APP_USAGE', 'FILE_ACCESS',
    'IDLE', 'LOGIN', 'LOGOUT',
    'FILE_DOWNLOAD_BULK', 'USB_DEVICE_CONNECTED', 'VPN_CONNECTED',
  ];

  const SAMPLE_METADATA: Record<string, object> = {
    WEBSITE_VISIT: { url: 'https://example.com', duration: 120 },
    APP_USAGE: { appName: 'Microsoft Word', windowTitle: 'Relatório Q4.docx' },
    FILE_ACCESS: { filePath: 'C:/Documents/confidential.pdf', operation: 'READ' },
    FILE_DOWNLOAD_BULK: { fileCount: 48, totalSizeMb: 1200, destination: 'USB' },
    USB_DEVICE_CONNECTED: { deviceName: 'Kingston DataTraveler', deviceId: 'USB001' },
  };

  const handleSimulate = async () => {
    if (!selectedUserId) {
      setMessage('Selecione um usuário primeiro.');
      return;
    }

    try {
      await createActivityLog({
        variables: {
          input: {
            userId: selectedUserId,
            action: selectedAction,
            metadata: SAMPLE_METADATA[selectedAction] || null,
          },
        },
      });
      setMessage(`✅ Evento "${selectedAction}" criado! Verifique o feed ao vivo.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage(`❌ Erro: ${err.message}`);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#166534' }}>
        🎮 Simulador de Eventos (para demo)
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#15803d', lineHeight: 1.5 }}>
        Simule atividades de funcionários para ver as Subscriptions GraphQL funcionando em tempo real.
        Abra o Dashboard em outra aba para ver os eventos aparecerem ao vivo.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
            Usuário
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, minWidth: 180 }}
          >
            <option value="">Selecione um usuário...</option>
            {usersData?.users?.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
            Ação
          </label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
          >
            {SAMPLE_ACTIONS.map((a) => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading || !selectedUserId}
          style={{
            padding: '8px 20px',
            backgroundColor: loading || !selectedUserId ? '#9ca3af' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loading || !selectedUserId ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {loading ? 'Enviando...' : '▶ Simular Evento'}
        </button>
      </div>

      {message && (
        <p style={{ margin: '12px 0 0', fontSize: 13, color: message.startsWith('✅') ? '#15803d' : '#dc2626' }}>
          {message}
        </p>
      )}
    </div>
  );
}
