/**
 * 📚 CONCEITO: Custom Hooks
 *
 * Custom Hooks são funções que começam com "use" e podem chamar outros Hooks.
 * Permitem extrair e reutilizar lógica stateful entre componentes.
 *
 * Benefícios:
 * - Separa lógica de UI da lógica de dados (separação de responsabilidades)
 * - Facilita testes (hooks são testáveis sem renderizar componentes)
 * - Evita duplicação de código entre componentes similares
 *
 * Este hook encapsula toda a lógica de buscar e processar dados de atividade,
 * incluindo filtragem, agrupamento e memoização dos resultados.
 */
'use client';

import { useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACTIVITY_LOGS } from '@/graphql/queries/activities';
import { GET_USERS } from '@/graphql/queries/users';
import { ActivityLog, ActivityChartData, ActivityLogFilters } from '@/types';

interface UseActivityDataReturn {
  activities: ActivityLog[];
  chartData: ActivityChartData[];
  actionCounts: Record<string, number>;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
}

export function useActivityData(filters?: ActivityLogFilters): UseActivityDataReturn {
  const { data, loading, error, refetch } = useQuery(GET_ACTIVITY_LOGS, {
    variables: { filters: filters || {} },
    // pollInterval: 30000, // alternativa ao subscription: polling a cada 30s
    // fetchPolicy: 'cache-and-network' garante que exibe cache imediatamente
    // mas também busca dados atualizados da rede
    fetchPolicy: 'cache-and-network',
  });

  const activities: ActivityLog[] = data?.activityLogs || [];

  /**
   * useMemo: recalcula chartData APENAS quando activities muda.
   *
   * POR QUE usar useMemo aqui?
   * groupByHour() itera sobre todos os logs e faz cálculos — é custoso.
   * Sem memo, seria recalculado em CADA render do componente pai,
   * mesmo que activities não tenha mudado (ex: quando o usuário digita
   * em um campo de busca no mesmo componente pai).
   *
   * Regra de ouro: use useMemo quando a computação é cara E o resultado
   * é passado como prop para componentes filhos memoizados.
   */
  const chartData = useMemo((): ActivityChartData[] => {
    if (activities.length === 0) return [];

    // Agrupa atividades por hora para o gráfico de linha
    const grouped: Record<string, number> = {};

    activities.forEach((log) => {
      const date = new Date(log.timestamp);
      // Formata como "HH:00" para agrupar por hora
      const hourKey = `${String(date.getHours()).padStart(2, '0')}:00`;
      grouped[hourKey] = (grouped[hourKey] || 0) + 1;
    });

    // Ordena as horas cronologicamente
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, count]) => ({ time, count }));
  }, [activities]); // Dependência: recalcula quando activities muda

  /**
   * useMemo para contagem de ações: útil para barras de progresso
   * mostrando quais ações são mais frequentes.
   */
  const actionCounts = useMemo((): Record<string, number> => {
    return activities.reduce(
      (acc, log) => ({
        ...acc,
        [log.action]: (acc[log.action] || 0) + 1,
      }),
      {} as Record<string, number>,
    );
  }, [activities]);

  /**
   * useCallback: memoiza a função refetch para que sua referência
   * não mude a cada render. Importante quando passada como prop
   * para componentes filhos envoltos em React.memo().
   *
   * Sem useCallback, componentes filhos que recebem refetch como prop
   * seriam rerenderizados a cada render do pai, mesmo sem mudança real.
   */
  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    activities,
    chartData,
    actionCounts,
    loading,
    error: error as Error | undefined,
    refetch: stableRefetch,
  };
}

// ============================================================
// Hook derivado: dados de usuários com estatísticas
// Demonstra composição de hooks customizados
// ============================================================

interface UserWithStats {
  id: string;
  name: string;
  email: string;
  role: string;
  activityCount: number;
}

export function useUsersWithStats() {
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS);
  const { activities, loading: activitiesLoading } = useActivityData();

  /**
   * Combina dados de usuários com contagem de atividades.
   * Exemplo de dado derivado complexo que se beneficia de useMemo:
   * faz um join em memória entre duas listas.
   */
  const usersWithStats = useMemo((): UserWithStats[] => {
    if (!usersData?.users) return [];

    const activityCountByUser: Record<string, number> = {};
    activities.forEach((log) => {
      activityCountByUser[log.userId] = (activityCountByUser[log.userId] || 0) + 1;
    });

    return usersData.users.map((user: any) => ({
      ...user,
      activityCount: activityCountByUser[user.id] || 0,
    }));
  }, [usersData?.users, activities]); // Recalcula quando qualquer um dos dois muda

  return {
    usersWithStats,
    loading: usersLoading || activitiesLoading,
  };
}
