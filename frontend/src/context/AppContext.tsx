/**
 * 📚 CONCEITO: Context API do React
 *
 * Context é a solução nativa do React para compartilhar estado entre componentes
 * sem precisar passar props manualmente por toda a árvore (prop drilling).
 *
 * Quando usar Context:
 * ✅ Estado verdadeiramente global: tema, usuário logado, idioma
 * ✅ Dados que muitos componentes precisam, mas não mudam com frequência
 * ❌ Estado que muda muito frequentemente (causa rerenders desnecessários)
 * ❌ Estado local de um componente (useState é suficiente)
 *
 * Alternativas para estado mais complexo: Zustand, Redux Toolkit, Jotai
 * Em entrevistas: saiba explicar quando Context pode causar problemas de performance
 * e como useReducer + Context se compara ao Redux.
 */
'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { ActivityLog, User, ActivityLogFilters } from '@/types';

// ============================================================
// TIPOS DO ESTADO GLOBAL
// ============================================================
interface AppState {
  // Usuário atualmente selecionado para visualizar detalhes
  selectedUser: User | null;
  // Filtros ativos na página de logs de atividade
  activityFilters: ActivityLogFilters;
  // Controla se o painel de detalhes está aberto
  isDetailPanelOpen: boolean;
  // Log mais recente recebido via subscription (para alertas)
  latestActivity: ActivityLog | null;
  // Indica se há novas atividades não lidas desde a última visita
  hasUnreadActivities: boolean;
}

// ============================================================
// ACTIONS — definem as transformações possíveis no estado
// Usando padrão similar ao Redux para clareza e previsibilidade
// ============================================================
type AppAction =
  | { type: 'SELECT_USER'; payload: User | null }
  | { type: 'SET_ACTIVITY_FILTERS'; payload: ActivityLogFilters }
  | { type: 'TOGGLE_DETAIL_PANEL' }
  | { type: 'SET_LATEST_ACTIVITY'; payload: ActivityLog }
  | { type: 'MARK_ACTIVITIES_READ' }
  | { type: 'RESET_FILTERS' };

// Estado inicial da aplicação
const initialState: AppState = {
  selectedUser: null,
  activityFilters: {},
  isDetailPanelOpen: false,
  latestActivity: null,
  hasUnreadActivities: false,
};

// ============================================================
// REDUCER — função pura que calcula o novo estado
// Pura = sem efeitos colaterais, mesmo input → mesmo output
// ============================================================
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_USER':
      return {
        ...state,
        selectedUser: action.payload,
        // Abre o painel de detalhes automaticamente ao selecionar um usuário
        isDetailPanelOpen: action.payload !== null,
      };

    case 'SET_ACTIVITY_FILTERS':
      return {
        ...state,
        activityFilters: { ...state.activityFilters, ...action.payload },
      };

    case 'TOGGLE_DETAIL_PANEL':
      return {
        ...state,
        isDetailPanelOpen: !state.isDetailPanelOpen,
      };

    case 'SET_LATEST_ACTIVITY':
      return {
        ...state,
        latestActivity: action.payload,
        hasUnreadActivities: true,
      };

    case 'MARK_ACTIVITIES_READ':
      return { ...state, hasUnreadActivities: false };

    case 'RESET_FILTERS':
      return { ...state, activityFilters: {} };

    default:
      return state;
  }
}

// ============================================================
// CONTEXTO
// Separamos em dois contextos: estado (leitura) e dispatch (escrita).
// Isso evita que componentes que só leem o estado sofram rerender
// quando o dispatch muda (ele nunca muda, mas a referência poderia).
// ============================================================
const AppStateContext = createContext<AppState | null>(null);
const AppDispatchContext = createContext<React.Dispatch<AppAction> | null>(null);

// ============================================================
// PROVIDER — envolve a árvore de componentes que precisa do contexto
// ============================================================
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    // Dois providers separados para otimizar rerenders
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// ============================================================
// HOOKS CUSTOMIZADOS — abstraem o consumo do contexto
// Boa prática: nunca use useContext(AppStateContext) diretamente fora deste arquivo.
// Use os hooks abaixo para garantir que o contexto está disponível.
// ============================================================

export function useAppState(): AppState {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState deve ser usado dentro de <AppProvider>');
  }
  return context;
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const context = useContext(AppDispatchContext);
  if (!context) {
    throw new Error('useAppDispatch deve ser usado dentro de <AppProvider>');
  }
  return context;
}

/**
 * Hook de conveniência que combina estado e ações comuns.
 * Encapsula a lógica de dispatch para que os componentes não
 * precisem conhecer a estrutura das actions.
 */
export function useAppActions() {
  const dispatch = useAppDispatch();

  // useCallback: memoiza as funções para que referências de função
  // não mudem a cada render, evitando rerenders de filhos que recebem
  // estas funções como props.
  // Aqui o array de dependências é [] porque dispatch nunca muda.
  const selectUser = useCallback(
    (user: User | null) => dispatch({ type: 'SELECT_USER', payload: user }),
    [dispatch],
  );

  const setActivityFilters = useCallback(
    (filters: ActivityLogFilters) =>
      dispatch({ type: 'SET_ACTIVITY_FILTERS', payload: filters }),
    [dispatch],
  );

  const resetFilters = useCallback(
    () => dispatch({ type: 'RESET_FILTERS' }),
    [dispatch],
  );

  const setLatestActivity = useCallback(
    (activity: ActivityLog) => dispatch({ type: 'SET_LATEST_ACTIVITY', payload: activity }),
    [dispatch],
  );

  const markActivitiesRead = useCallback(
    () => dispatch({ type: 'MARK_ACTIVITIES_READ' }),
    [dispatch],
  );

  return { selectUser, setActivityFilters, resetFilters, setLatestActivity, markActivitiesRead };
}
