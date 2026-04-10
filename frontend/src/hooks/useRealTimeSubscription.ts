/**
 * 📚 CONCEITO: useSubscription — dados em tempo real com GraphQL
 *
 * useSubscription conecta ao WebSocket e mantém o componente atualizado
 * automaticamente quando novos dados chegam do servidor.
 *
 * Fluxo técnico:
 * 1. Hook chama Apollo Client que abre/reutiliza conexão WebSocket
 * 2. Servidor envia mensagem sempre que pubSub.publish() é chamado
 * 3. Apollo Client atualiza o estado do hook automaticamente
 * 4. React rerenderiza o componente com os novos dados
 *
 * Em entrevistas: saiba comparar Subscriptions vs Polling vs Server-Sent Events (SSE)
 * - Subscriptions: bidirecional, ideal para alta frequência
 * - SSE: unidirecional, mais simples, sem biblioteca especial
 * - Polling: simples, mas cria carga desnecessária no servidor
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSubscription } from '@apollo/client';
import { ACTIVITY_LOG_CREATED } from '@/graphql/subscriptions/activities';
import { useAppActions } from '@/context/AppContext';
import { ActivityLog } from '@/types';

interface UseRealTimeSubscriptionOptions {
  // Callback chamado quando uma nova atividade chega
  onNewActivity?: (activity: ActivityLog) => void;
  // Se false, pausa a subscription sem desmontar o componente
  enabled?: boolean;
}

interface UseRealTimeSubscriptionReturn {
  latestActivity: ActivityLog | null;
  isConnected: boolean;
  activityBuffer: ActivityLog[];
  clearBuffer: () => void;
}

export function useRealTimeSubscription({
  onNewActivity,
  enabled = true,
}: UseRealTimeSubscriptionOptions = {}): UseRealTimeSubscriptionReturn {
  // Buffer local de atividades recebidas em tempo real
  // Usamos useRef para o buffer porque queremos acumulá-lo sem causar
  // rerenders a cada nova atividade (apenas limpamos quando o usuário pede)
  const bufferRef = useRef<ActivityLog[]>([]);
  const latestActivityRef = useRef<ActivityLog | null>(null);

  const { setLatestActivity } = useAppActions();

  const { data, loading, error } = useSubscription(ACTIVITY_LOG_CREATED, {
    // skip: quando enabled=false, não abre a conexão WebSocket
    skip: !enabled,
    // onData: callback chamado a cada mensagem recebida
    onData: ({ data }) => {
      const newActivity: ActivityLog = data.data?.activityLogCreated;
      if (!newActivity) return;

      // Atualiza o estado global via Context
      setLatestActivity(newActivity);

      // Acumula no buffer local (sem rerender)
      bufferRef.current = [newActivity, ...bufferRef.current].slice(0, 50);
      latestActivityRef.current = newActivity;

      // Chama o callback opcional do chamador
      onNewActivity?.(newActivity);
    },
  });

  /**
   * useCallback: limpar o buffer é uma operação que pode ser passada
   * como prop para um botão filho. Memoizamos para evitar que o botão
   * rerendere desnecessariamente.
   */
  const clearBuffer = useCallback(() => {
    bufferRef.current = [];
  }, []);

  // isConnected: considera conectado se não há loading e não há erro
  const isConnected = !loading && !error && enabled;

  return {
    latestActivity: data?.activityLogCreated || null,
    isConnected,
    activityBuffer: bufferRef.current,
    clearBuffer,
  };
}

// ============================================================
// Hook auxiliar: debounce para inputs de busca
// Evita disparar queries GraphQL a cada tecla digitada
// ============================================================
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Agenda a atualização após o delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cleanup: cancela o timer se o value mudar antes do delay
    // Isso é o que cria o efeito de "esperar o usuário parar de digitar"
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
